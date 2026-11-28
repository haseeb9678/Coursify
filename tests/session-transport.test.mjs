import assert from "node:assert/strict";
import { test } from "node:test";
import { createSessionTransport, SessionRefreshUnavailableError } from "../lib/graphql/session-transport.ts";

const endpoint = "https://lms.example.test/api/graphql";
const request = (query) => ({ method: "POST", body: JSON.stringify({ query }) });
const me = request("query { me { id } }");
const denied = (field, authReason = "ACCESS_TOKEN_EXPIRED") => Response.json({
    data: null, errors: [{ path: [field], extensions: { authReason } }],
});
const renewed = () => Response.json(
    { data: { refreshSession: { success: true } } },
    { headers: { "x-access-expires-at": String(Date.now() + 900_000) } },
);
const success = () => Response.json({ data: { me: { id: "student" } } });

function deferred() {
    let release;
    const wait = new Promise((resolve) => { release = resolve; });
    return { wait, release };
}

test("shares refresh across simultaneous and late 401s and retries each request once", async () => {
    const started = deferred(), rotate = deferred(), late = deferred();
    let refreshCount = 0, requestCount = 0, lateCalls = 0;
    const transport = createSessionTransport({ endpoint, fetch: async (_url, init) => {
        const { query } = JSON.parse(init.body);
        assert.equal(init.credentials, "include");
        if (query.includes("refreshSession")) {
            refreshCount++;
            started.release();
            await rotate.wait;
            return renewed();
        }
        requestCount++;
        if (requestCount <= 2) return denied("me");
        if (query.includes("Late") && ++lateCalls === 1) {
            await late.wait;
            return denied("me");
        }
        return success();
    } });
    const first = transport.fetch(endpoint, me), second = transport.fetch(endpoint, me);
    await started.wait;
    const lateRequest = transport.fetch(endpoint, request("query Late { me { id } }"));
    rotate.release();
    assert.deepEqual((await (await first).json()).data, { me: { id: "student" } });
    await second;
    late.release();
    await lateRequest;
    assert.equal(refreshCount, 1);
    assert.equal(requestCount, 6);
    assert.equal(lateCalls, 2);
});

test("uses a shared browser lock and credential revision across tabs", async () => {
    const store = new Map();
    const storage = { getItem: store.get.bind(store), setItem: store.set.bind(store) };
    const gate = deferred(), started = deferred();
    let queue = Promise.resolve(), refreshCount = 0, active = false, initialCalls = 0;
    const locks = { request: (_name, work) => {
        const result = queue.then(work);
        queue = result.catch(() => {});
        return result;
    } };
    const options = { endpoint, storage, locks, fetch: async (_url, init) => {
        if (JSON.parse(init.body).query.includes("refreshSession")) {
            refreshCount++;
            started.release();
            await gate.wait;
            active = true;
            return renewed();
        }
        initialCalls++;
        return active ? success() : denied("me");
    } };
    const left = createSessionTransport(options), right = createSessionTransport(options);
    const requests = [left.fetch(endpoint, me), right.fetch(endpoint, me)];
    await started.wait;
    gate.release();
    await Promise.all(requests);
    assert.equal(initialCalls, 4);
    assert.equal(refreshCount, 1);
    assert.equal(store.size, 1);
});

test("retries an interrupted refresh with its original request ID and keeps failed sessions signed in", async () => {
    const refreshIds = [];
    const transport = createSessionTransport({ endpoint, fetch: async (_url, init) => {
        const { variables, query } = JSON.parse(init.body);
        if (!query.includes("refreshSession")) return denied("me");
        refreshIds.push(variables.requestId);
        if (refreshIds.length === 1) throw new TypeError("Offline");
        return new Response(null, { status: 503 });
    } });
    await assert.rejects(transport.fetch(endpoint, me), SessionRefreshUnavailableError);
    assert.equal(transport.isSignedOut(), false);
    assert.equal(refreshIds.length, 2);
    assert.equal(refreshIds[0], refreshIds[1]);
});

test("does not replay ambiguous mutations, permission errors, or auth mutations", async () => {
    const queries = [
        ["mutation { modifyOne modifyTwo }", denied("modifyTwo")],
        ["mutation { modifyOne }", Response.json({ errors: [{ path: ["modifyOne", "nested"], extensions: { authReason: "ACCESS_TOKEN_MISSING" } }] })],
        ["mutation { logout { success } }", denied("logout")],
        ["mutation { resetPassword { success } }", denied("resetPassword")],
        ["mutation { modifyOne }", Response.json({ errors: [{ path: ["modifyOne"], extensions: { code: "FORBIDDEN" } }] })],
    ];
    let count = 0;
    const transport = createSessionTransport({ endpoint, fetch: async () => queries[count++][1] });
    for (const [query, response] of queries) assert.equal(await transport.fetch(endpoint, request(query)), response);
    assert.equal(count, queries.length);
});

test("retries a single mutation only once after a guard rejection", async () => {
    let mutations = 0, refreshes = 0;
    const transport = createSessionTransport({ endpoint, fetch: async (_url, init) => {
        if (JSON.parse(init.body).query.includes("refreshSession")) {
            refreshes++;
            return renewed();
        }
        mutations++;
        return denied("modifyOne");
    } });
    const response = await transport.fetch(endpoint, request("mutation { modifyOne { success } }"));
    assert.equal((await response.json()).errors[0].path[0], "modifyOne");
    assert.equal(mutations, 2);
    assert.equal(refreshes, 1);
});

test("a rate-limited refresh leaves the session in place and respects the retry delay", async () => {
    let refreshes = 0;
    const transport = createSessionTransport({ endpoint, fetch: async (_url, init) => {
        if (!JSON.parse(init.body).query.includes("refreshSession")) return denied("me");
        refreshes++;
        return new Response(null, { status: 429, headers: { "Retry-After": "10" } });
    } });
    await assert.rejects(transport.fetch(endpoint, me), SessionRefreshUnavailableError);
    await assert.rejects(transport.fetch(endpoint, me), SessionRefreshUnavailableError);
    assert.equal(transport.isSignedOut(), false);
    assert.equal(refreshes, 1);
});

test("confirmed invalid refresh signs out and logout supersedes an in-flight refresh", async () => {
    const revoked = createSessionTransport({ endpoint, fetch: async (_url, init) =>
        JSON.parse(init.body).query.includes("refreshSession")
            ? denied("refreshSession", "SESSION_REVOKED") : denied("me"),
    });
    const events = [];
    revoked.subscribe((event) => events.push(event));
    await revoked.fetch(endpoint, me);
    assert.equal(revoked.isSignedOut(), true);
    assert.equal(events.filter((event) => event === "signed-out").length, 1);

    const started = deferred(), rotate = deferred();
    let calls = 0, logoutSent = false;
    const transport = createSessionTransport({ endpoint, fetch: async (_url, init) => {
        calls++;
        if (!JSON.parse(init.body).query.includes("refreshSession")) return denied("me");
        started.release();
        await rotate.wait;
        return renewed();
    } });
    const pending = transport.fetch(endpoint, me);
    await started.wait;
    const logout = transport.runIdentityAction("logout", async () => { logoutSent = true; });
    assert.equal(logoutSent, false);
    rotate.release();
    await Promise.all([pending, logout]);
    assert.equal(logoutSent, true);
    assert.equal(transport.isSignedOut(), true);
    assert.equal(calls, 2);
});
