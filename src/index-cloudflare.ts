import app from "./app";
import { env } from "cloudflare:workers";
import { httpServerHandler } from "cloudflare:node";
import { pipeResponse } from "./routes/util";
import emitStats, { STATS_HEADER } from "./stats";
import { stat } from "fs";

app.get

const port = Number(process.env.PORT) || 3000;
const server = httpServerHandler({ port: port });
app.listen(port);

app.get("/{*path}", async (req, res) => {
    const upstream = await env.ASSETS.fetch(req.originalUrl);
    await pipeResponse(upstream, res)
})


const cloudflare: ExportedHandler = {
    async fetch(request, env, ctx) {
        const start = performance.now();
        const response = await server.fetch(request, env, ctx);
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