interface Config {
    auth?: {
        access_token: string;
        user: {
            id: string;
        };
    };
}
export declare function getConfig(): Promise<Config>;
export {};
