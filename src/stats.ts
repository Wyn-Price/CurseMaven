const hostRewrites: Record<string, string | undefined> = {
    "www.cursemaven.com": "cursemaven.com",
    "cfa2.cursemaven.com": "beta.cursemaven.com",
}

export const STATS_HEADER = "X-CurseMaven-Stats";

const emitStats = async (request: Request, response: Response, durationMs: number, stats: string) => {
    try {
        const apiKey = process.env.DD_API_KEY
        if (!apiKey) {
            return;
        }

        const cursemavenData: Record<string, string> = JSON.parse(stats);

        const url = new URL(request.url);

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
                path: url.pathname,
                statusCode: response.status,
            },
            statusCode: response.status,
            timestamp: Date.now(),
        };

        const hostname = hostRewrites[url.hostname] ?? url.hostname;

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
                'DD-API-KEY': apiKey,
            }),
        })
    } catch (err) {
        console.error("Caught error while emitting stats: ")
        console.error(err)
    }
}

export default emitStats;
