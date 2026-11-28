const AUTH_COOKIE = /^(?:access_token|refresh_token)=/;
const RESPONSE_HEADERS = ["content-type", "retry-after", "x-access-expires-at"];
const noStore = { "Cache-Control": "private, no-store" };

export async function POST(request: Request): Promise<Response> {
    const originHeader = request.headers.get("origin");
    const origin = originHeader && URL.canParse(originHeader) ? new URL(originHeader) : undefined;
    const site = request.headers.get("sec-fetch-site");
    if (!origin || origin.origin !== originHeader || origin.host !== request.headers.get("host")?.toLowerCase() ||
        origin.protocol !== new URL(request.url).protocol || (site && site !== "same-origin")) {
        return Response.json({ errors: [{ message: "Untrusted request origin" }] }, { status: 403, headers: noStore });
    }
    if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
        return Response.json({ errors: [{ message: "Expected a JSON request" }] }, { status: 415, headers: noStore });
    }

    const endpoint = process.env.GRAPHQL_URL ?? process.env.NEXT_PUBLIC_GRAPHQL_URL;
    if (!endpoint || !URL.canParse(endpoint) || !["http:", "https:"].includes(new URL(endpoint).protocol)) {
        return Response.json({ errors: [{ message: "GraphQL endpoint is not configured" }] }, { status: 503, headers: noStore });
    }

    const cookies = request.headers.get("cookie")?.split(";").map((cookie) => cookie.trim()).filter((cookie) => AUTH_COOKIE.test(cookie));
    const headers = new Headers({ "Content-Type": "application/json", Origin: origin.origin });
    if (cookies?.length) headers.set("Cookie", cookies.join("; "));
    const userAgent = request.headers.get("user-agent");
    if (userAgent) headers.set("User-Agent", userAgent);

    try {
        const upstream = await fetch(endpoint, {
            method: "POST",
            headers,
            body: await request.text(),
            cache: "no-store",
            redirect: "error",
        });
        const responseHeaders = new Headers(noStore);
        for (const name of RESPONSE_HEADERS) {
            const value = upstream.headers.get(name);
            if (value) responseHeaders.set(name, value);
        }
        for (const cookie of upstream.headers.getSetCookie()) {
            if (AUTH_COOKIE.test(cookie) && !/;\s*domain\s*=/i.test(cookie)) {
                responseHeaders.append("Set-Cookie", cookie);
            }
        }
        return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
    } catch {
        return Response.json({ errors: [{ message: "The API is temporarily unavailable" }] }, { status: 502, headers: noStore });
    }
}
