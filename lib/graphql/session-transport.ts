import { Kind, parse } from "graphql";

const identityKey = "coursify.auth.identity";
const credentialKey = "coursify.auth.credentials";
const accessFailures = new Set(["ACCESS_TOKEN_MISSING", "ACCESS_TOKEN_EXPIRED", "ACCESS_TOKEN_INVALID"]);
const invalidSessions = new Set(["SESSION_EXPIRED", "SESSION_REVOKED", "ACCOUNT_INACTIVE"]);
const invalidRefresh = new Set(["REFRESH_COOKIE_MISSING", "REFRESH_TOKEN_INVALID", "REFRESH_TOKEN_EXPIRED", ...invalidSessions]);
const authActions = /^(?:login|logout|register|refreshSession|.*password.*)$/i;

type SessionEvent = "signed-out" | "identity-changed" | "refresh-start" | "refresh-end";
type GraphQLFailure = { path?: unknown[]; extensions?: { authReason?: string; statusCode?: number } };
type AuthBody = { data?: { refreshSession?: { success: boolean } } | null; errors?: GraphQLFailure[] };
type RefreshResult = "renewed" | "signed-out" | "unavailable";

function operation(init?: RequestInit) {
    if (typeof init?.body !== "string") return;
    try {
        const { query, operationName } = JSON.parse(init.body) as { query: string; operationName?: string };
        const definitions = parse(query).definitions;
        const selected = definitions.find((node) => node.kind === Kind.OPERATION_DEFINITION &&
            (!operationName || node.name?.value === operationName));
        if (selected?.kind !== Kind.OPERATION_DEFINITION || selected.selectionSet.selections.length !== 1) return;
        const field = selected.selectionSet.selections[0];
        if (field.kind !== Kind.FIELD || authActions.test(field.name.value)) return;
        return { path: field.alias?.value ?? field.name.value };
    } catch {
        return;
    }
}

async function authBody(response: Response): Promise<AuthBody | undefined> {
    if (!response.headers.get("content-type")?.includes("json")) return;
    return response.clone().json().catch(() => undefined);
}

function terminalReason(body: AuthBody | undefined, path: string) {
    if (body?.data != null || body?.errors?.length !== 1) return;
    const [error] = body.errors;
    return error?.path?.length === 1 && error.path[0] === path ? error.extensions?.authReason : undefined;
}

export class SessionRefreshUnavailableError extends Error {
    constructor() { super("Unable to refresh your session. Please try again."); }
}

interface TransportOptions {
    fetch: typeof fetch;
    endpoint: string;
    locks?: Pick<LockManager, "request">;
    storage?: Pick<Storage, "getItem" | "setItem">;
}

export function createSessionTransport({ fetch: send, endpoint, locks, storage }: TransportOptions) {
    const listeners = new Set<(event: SessionEvent) => void>();
    const memory = new Map<string, string>();
    let revision = 0;
    let actionCount = 0;
    let actionTail = Promise.resolve();
    let inFlight: Promise<RefreshResult> | undefined;
    let accessExpiresAt = 0;
    let nextAttemptAt = 0;
    let nextProactiveAt = 0;
    let unfinished: { identity: string; credential?: string; id: string; startedAt: number } | undefined;

    function receive(event: SessionEvent) {
        listeners.forEach((listener) => listener(event));
    }
    function read(key: string) {
        try { return storage?.getItem(key) ?? memory.get(key); }
        catch { return memory.get(key); }
    }
    function write(key: string, value: string) {
        memory.set(key, value);
        try { storage?.setItem(key, value); } catch { /* Storage can be disabled by the browser. */ }
    }
    function identity() {
        return `${revision}:${read(identityKey) ?? ""}`;
    }
    function isSignedOut() {
        return read(identityKey)?.startsWith("out:") ?? false;
    }
    async function exclusive<T>(work: () => Promise<T>): Promise<T> {
        return locks ? await locks.request("coursify.auth.cookies", work) : work();
    }
    function rememberExpiry(response: Response) {
        const expiry = Number(response.headers.get("x-access-expires-at"));
        if (expiry > 0) accessExpiresAt = Math.max(expiry, accessExpiresAt);
        return expiry;
    }
    function signOut(expectedIdentity: string) {
        if (identity() !== expectedIdentity || actionCount || isSignedOut()) return;
        write(identityKey, `out:${crypto.randomUUID()}`);
        accessExpiresAt = 0;
        receive("signed-out");
    }
    function post(query: string, variables?: Record<string, string>) {
        return send(endpoint, {
            method: "POST", credentials: "include", cache: "no-store", signal: AbortSignal.timeout(5_000),
            headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }),
        });
    }
    async function waitForWinner(expectedIdentity: string, credential: string | undefined) {
        const previousExpiry = accessExpiresAt;
        for (const wait of [100, 250, 500]) {
            await new Promise((resolve) => setTimeout(resolve, wait));
            if (identity() !== expectedIdentity || actionCount) return false;
            if (read(credentialKey) !== credential) return true;
            try {
                const response = await post("query VerifySession { me { id } }");
                const expiry = Number(response.headers.get("x-access-expires-at"));
                if (expiry > Date.now() && expiry !== previousExpiry) {
                    rememberExpiry(response);
                    return true;
                }
            } catch {
                // A connectivity problem is not proof of a signed-out session.
            }
        }
        return false;
    }
    async function renew(expectedIdentity: string, credential: string | undefined): Promise<RefreshResult> {
        if (identity() !== expectedIdentity || actionCount) return "unavailable";
        if (isSignedOut()) return "signed-out";
        if (read(credentialKey) !== credential) return "renewed";
        if (inFlight) return inFlight;
        if (Date.now() < nextAttemptAt) return "unavailable";

        inFlight = exclusive(async (): Promise<RefreshResult> => {
            if (identity() !== expectedIdentity || actionCount) return "unavailable";
            if (read(credentialKey) !== credential) return "renewed";

            if (!unfinished || unfinished.identity !== expectedIdentity || unfinished.credential !== credential ||
                Date.now() - unfinished.startedAt >= 15_000) {
                unfinished = { identity: expectedIdentity, credential, id: crypto.randomUUID(), startedAt: Date.now() };
            }
            const requestId = unfinished.id;
            for (let attempt = 0; attempt < 2; attempt++) {
                if (identity() !== expectedIdentity || actionCount) return "unavailable";
                let response: Response | undefined;
                try {
                    response = await post(
                        "mutation RefreshSession($requestId: String!) { refreshSession(requestId: $requestId) { success } }",
                        { requestId },
                    );
                } catch {
                    // Retry this same rotation once if the response was lost.
                }
                const body = response && await authBody(response);
                if (identity() !== expectedIdentity || actionCount) return "unavailable";
                if (response?.ok && body?.data?.refreshSession?.success) {
                    unfinished = undefined;
                    accessExpiresAt = 0;
                    rememberExpiry(response);
                    write(credentialKey, crypto.randomUUID());
                    return "renewed";
                }
                const reason = terminalReason(body, "refreshSession") ?? "";
                if (invalidRefresh.has(reason)) {
                    unfinished = undefined;
                    if (read(credentialKey) !== credential) return "renewed";
                    signOut(expectedIdentity);
                    return "signed-out";
                }
                if (reason === "REFRESH_ROTATION_CONFLICT") {
                    return await waitForWinner(expectedIdentity, credential) ? "renewed" : "unavailable";
                }
                const serverFailure = body?.errors?.some((error) => {
                    const status = error?.extensions?.statusCode;
                    return typeof status === "number" && status >= 500;
                });
                if (response && response.status < 500 && !serverFailure) {
                    const retryAfter = Number(response.headers.get("retry-after"));
                    if (retryAfter > 0) nextAttemptAt = Date.now() + Math.min(retryAfter, 60) * 1000;
                    break;
                }
                if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 200));
            }
            nextAttemptAt = Math.max(nextAttemptAt, Date.now() + 3_000);
            return "unavailable";
        }).catch((): RefreshResult => "unavailable").finally(() => {
            inFlight = undefined;
            receive("refresh-end");
        });
        receive("refresh-start");
        return inFlight;
    }

    return {
        identity,
        isSignedOut,
        subscribe(listener: (event: SessionEvent) => void) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        onStorage(event: StorageEvent) {
            if (event.key !== identityKey || event.newValue !== read(identityKey)) return;
            accessExpiresAt = 0;
            nextAttemptAt = 0;
            nextProactiveAt = 0;
            unfinished = undefined;
            receive(isSignedOut() ? "signed-out" : "identity-changed");
        },
        activity() {
            const now = Date.now();
            if (accessExpiresAt && accessExpiresAt - now <= 30_000 && now >= nextProactiveAt) {
                nextProactiveAt = now + 15_000;
                void renew(identity(), read(credentialKey));
            }
        },
        async runIdentityAction<T>(action: "login" | "logout", work: () => Promise<T>) {
            const actionRevision = ++revision;
            actionCount += 1;
            const queued = actionTail.then(async () => {
                await inFlight;
                return exclusive(async () => {
                    const result = await work();
                    const marker = crypto.randomUUID();
                    write(identityKey, `${action === "logout" ? "out" : "in"}:${marker}`);
                    write(credentialKey, marker);
                    nextAttemptAt = 0;
                    nextProactiveAt = 0;
                    unfinished = undefined;
                    if (action === "logout") accessExpiresAt = 0;
                    return { result, identity: `${actionRevision}:${read(identityKey) ?? ""}` };
                });
            });
            actionTail = queued.then(() => undefined, () => undefined);
            try { return await queued; } finally { actionCount -= 1; }
        },
        async fetch(input: RequestInfo | URL, init?: RequestInit) {
            const expectedIdentity = identity();
            const credential = read(credentialKey);
            const request = () => send(input, { ...init, credentials: "include", cache: "no-store" });
            const response = await request();
            if (identity() !== expectedIdentity || init?.signal?.aborted) {
                return response;
            }
            const expiry = rememberExpiry(response);
            if (expiry > 0) return response;
            const field = operation(init);
            if (!field) return response;
            const reason = terminalReason(await authBody(response), field.path) ?? "";
            if (invalidSessions.has(reason)) signOut(expectedIdentity);
            if (accessFailures.has(reason)) {
                const refreshed = await renew(expectedIdentity, credential);
                if (identity() !== expectedIdentity || init?.signal?.aborted) return response;
                if (refreshed === "unavailable") throw new SessionRefreshUnavailableError();
                if (refreshed !== "renewed") return response;
                const retried = await request();
                if (identity() === expectedIdentity) {
                    rememberExpiry(retried);
                    const retryReason = terminalReason(await authBody(retried), field.path) ?? "";
                    if (invalidSessions.has(retryReason)) signOut(expectedIdentity);
                }
                return retried;
            }
            return response;
        },
    };
}
