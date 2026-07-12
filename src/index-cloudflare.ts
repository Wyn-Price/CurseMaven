import app from "./app";
import { httpServerHandler } from "cloudflare:node";
import emitStats, { STATS_HEADER } from "./stats";

app.get

const port = Number(process.env.PORT) || 3000;
const server = httpServerHandler({ port: port });
app.listen(port);

const cloudflare: ExportedHandler = {
    async fetch(request, env, ctx) {
        const start = performance.now();

        let response;
        try {
            response = await server.fetch!(request, env, ctx);
        } catch (err) {
            console.error("Caught: ", err);
            response = new Response(null, {
                status: 500,
            });
        }
        const duration = performance.now() - start;

        const stats = response.headers.get(STATS_HEADER);
        response.headers.delete(STATS_HEADER);

        if (stats) {
            ctx.waitUntil(emitStats(request, response, duration, stats))
        }

        return response;
    },
};

export default cloudflare;
