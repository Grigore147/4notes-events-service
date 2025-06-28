export type Configuration = {
    app: {
        name: string;
        env: string;
        debug: boolean;
        timezone: string;
        url: string;
        port: number;
    };
    auth: {
        api: {
            url: string;
            key: string;
        };
    };
    kafka: {
        clientId: string;
        groupId: string;
        brokers: string[];
    };
    redis: {
        name?: string;
        host: string;
        port: number;
        username?: string;
        password?: string;
        database: number;
    };
};

export default (): Configuration => ({
    app: {
        name: process.env.APP_NAME ?? '4notes-events-service',
        env: process.env.APP_ENV ?? 'local',
        debug: process.env.APP_DEBUG === 'true',
        timezone: process.env.APP_TIMEZONE ?? 'UTC',
        url: process.env.APP_URL ?? 'https://events.4notes.app',
        port: parseInt(process.env.APP_PORT ?? '3000', 10)
    },

    auth: {
        api: {
            url: process.env.AUTH_API_URL ?? 'https://auth.4notes.app/api',
            key: process.env.AUTH_API_KEY ?? '4notes-events-service'
        }
    },

    kafka: {
        clientId: process.env.KAFKA_CLIENT_ID ?? '4notes-events-service',
        groupId: process.env.KAFKA_GROUP_ID ?? '4notes-events-service',
        brokers: process.env.KAFKA_BROKERS?.split(',') ?? []
    },

    redis: {
        name: process.env.REDIS_CLIENT_NAME ?? '4notes-events-service',
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
        username: process.env.REDIS_USERNAME ?? undefined,
        password: process.env.REDIS_PASSWORD ?? undefined,
        database: parseInt(process.env.REDIS_DB ?? '0', 10)
    }
});
