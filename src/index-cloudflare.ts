import app from "./app";
import { httpServerHandler } from "cloudflare:node";
import { FOLLOW_REDIRECT_HEADER } from "./routes/util";
import emitStats, { STATS_HEADER } from "./stats";

const port = Number(process.env.PORT) || 3000;
const server = httpServerHandler({ port: port });
app.listen(port);

const cloudflare: ExportedHandler = {
    async fetch(request, env, ctx) {
        const start = performance.now();

        let response;
        let stats = null;
        try {
            response = await server.fetch!(request, env, ctx);

            stats = response.headers.get(STATS_HEADER);
            response.headers.delete(STATS_HEADER);

            // Follow download redirects ourselves rather than passing them
            // on, as gradle does a pretty bad job at following them
            const location = response.headers.get("Location");
            if (response.headers.has(FOLLOW_REDIRECT_HEADER) && location !== null) {
                response = await fetch(location);
            }
        } catch (err) {
            console.error("Caught: ", err);
            response = new Response(null, {
                status: 500,
            });
        }
        const duration = performance.now() - start;

        if (stats) {
            ctx.waitUntil(emitStats(request, response, duration, stats))
        }

        return response;
    },
};

export default cloudflare;
