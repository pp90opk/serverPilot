Bun.serve({
    port: 10000,
    async fetch(req: Request) {
        return modifyFallback(req);
    },
});

let fallbackServer;
try {
    fallbackServer = await Bun.file("/etc/usr/fallBackServer.json").json();
} catch (error) {
    console.error("Failed to load fallback server configuration:", error);
    fallbackServer = {};
}

console.log(`Server is running on http://localhost:10000`);

async function modifyFallback(req: Request) {
    const url = new URL(req.url);
    const { host } = url;
    const fallback = fallbackServer?.[host];

    if (fallback) {
        const fetchPromises = fallback.map(async (newreq) => {
            const newUrl = req.url.replace(url.origin, newreq);
            const headers = new Headers(req.headers);

            if (new URL(newUrl).hostname !== "localhost") {
                headers.set('Host', new URL(newUrl).host);
            }
            try {
                const response = await fetch(new Request(newUrl, {
                    ...req,
                    headers: headers
                }));
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                console.error(`Error fetching from ${newreq}:`, error);
            }
            return null;
        });

        // Use Promise.any to return the first successful response
        try {
            const successfulResponse = await Promise.any(fetchPromises);
            return successfulResponse;
        } catch {
            return new Response("Server offline, please fix it", { status: 504 });
        }
    } else {
        return new Response("No fallback server set", { status: 504 });
    }
}
// ... existing code ...