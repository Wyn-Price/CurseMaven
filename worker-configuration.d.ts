interface __BaseEnv_Env {
    ASSETS: Fetcher;
    CF_API_KEY: string;
    DD_API_KEY: string;
}

declare namespace Cloudflare {
    interface GlobalProps {
        mainModule: typeof import("./src/index-cloudflare");
    }

    interface ProdEnv {
        ASSETS: Fetcher;
        CF_API_KEY: string;
        DD_API_KEY: string;
    }

    interface BetaEnv {
        ASSETS: Fetcher;
        CF_API_KEY: string;
        DD_API_KEY: string;
    }

    interface Env extends __BaseEnv_Env { }
}

interface Env extends __BaseEnv_Env { }

type StringifyValues<EnvType extends Record<string, unknown>> = {
    [Binding in keyof EnvType]: EnvType[Binding] extends string
    ? EnvType[Binding]
    : string;
};

declare namespace NodeJS {
    interface ProcessEnv
        extends StringifyValues<Pick<Cloudflare.Env, "CF_API_KEY" | "DD_API_KEY">> { }
}