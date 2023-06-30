export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        ctx.passThroughOnException()

        // const PROXY_HOST_OVERRIDE = await env.KV_DATADOG.get("PROXY_HOST_OVERRIDE")
        // if (PROXY_HOST_OVERRIDE !== null) {
        //     const url = new URL(request.url);
        //     url.host = PROXY_HOST_OVERRIDE;
        //     request = new Request(url, request)
        // }

        const time = Date.now()
        const response = await fetch(request, { redirect: 'follow' })
        const duration = Date.now() - time

        const stats = response.headers.get("X-CurseMaven-Stats");
        const apiKey = await env.KV_DATADOG.get("DD_API_KEY");

        if (apiKey !== null && stats !== null) {
            ctx.waitUntil(this.logMetrics(request, response, stats, apiKey, duration))
        }

        return response
    },

    async logMetrics(request: Request, response: Response, stats: string, ddApiKey: string, durationMs: number) {
        const statsParam = new URLSearchParams(`?${stats}`)

        const cursemavenData: Record<string, string> = {};
        [...statsParam.entries()]
            .filter(([_, value]) => value !== "")
            .forEach(([key, value]) => cursemavenData[key] = decodeURIComponent(value));

        // Weird structure is to match how vercel used to format data
        const metrics = {
            cursemaven: cursemavenData,
            data: {
                userAgent: request.headers.get("User-Agent") ?? undefined,
                vercel: {
                    duration: durationMs,
                },
            },
            network: {
                client: {
                    geoip: {
                        country: {
                            iso_code: request.headers.get("Cf-Ipcountry") ?? undefined
                        }
                    }
                }
            },
            http: {
                status_code: response.status,
            },
            proxy: {
                path: new URL(request.url).pathname,
                statusCode: response.status,
            },
            statusCode: response.status,
            timestamp: Date.now(),
        };

        const hostname = request.headers.get('host') ?? '';

        const data = {
            ddsource: 'cloudflare',
            ddtags: 'service:cloudflare,source:cloudflare,site:' + hostname,
            hostname: hostname,
            message: metrics,
        };

        const datadogEndpoint = 'https://http-intake.logs.datadoghq.com/v1/input/'

        await fetch(datadogEndpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: new Headers({
                'Content-Type': 'application/json',
                'DD-API-KEY': ddApiKey,
            }),
        })
    }
};
