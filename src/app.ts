Bun.serve({
    port: 10000,
    async fetch(req: Request) {
        return modifyFallback(req); // Removed unnecessary await
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
        for (const newreq of fallback) {
            try {
                const response = await fetch(new Request(req.url.replace(url.origin, newreq), req));
                if (response.ok) {
                    return response;
                }
            } catch (error) {
                console.error(`Error fetching from ${newreq}:`, error);
            }
        }
        return new Response("Server offline, please fix it", { status: 504 });
    } else {
        return new Response("No fallback server set", { status: 504 });
    }
}