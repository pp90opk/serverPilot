import { serve } from "bun";

const port = 10000;

let fallbackServer: Record<string, string[]> = {};
try {
    fallbackServer = await Bun.file("/etc/usr/fallBackServer.json").json();
} catch (error) {
    console.error("Failed to load fallback server configuration:", error);
}

console.log(`Server is running on http://localhost:${port}`);

serve({
    port,
    async fetch(req: Request) {
        return handleRequest(req);
    },
});
async function handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const hostFallbacks = fallbackServer[url.host];

    if (!hostFallbacks) {
        return new Response("No fallback server set", { status: 504 });
    }
    try {
        const response = await Promise.any(
            hostFallbacks.map((origin) => forwardRequest(req, origin))
        );
        return response;
    } catch (error) {
        console.error("All fallback servers failed:", error);
        return new Response("All servers are offline, please try again later", { status: 504 });
    }
}

async function forwardRequest(req: Request, origin: string): Promise<Response> {
    const originalUrl = new URL(req.url);
    const newUrl = originalUrl.href.replace(originalUrl.origin, origin);
    const headers = new Headers(req.headers);
    if (new URL(newUrl).hostname !== "localhost") {
        headers.set("Host", new URL(newUrl).host);
    }

    try {
        const response = await fetch(newUrl, { method: req.method, headers, body: req.body });
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error(`Error forwarding request to ${origin}:`, error);
        throw error;
    }
}