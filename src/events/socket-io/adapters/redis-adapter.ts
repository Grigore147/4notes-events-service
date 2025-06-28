import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { Configuration } from 'src/config';

export class RedisIoAdapter extends IoAdapter {
    private adapterConstructor: ReturnType<typeof createAdapter>;
    private config: ConfigService;

    constructor(app: INestApplication) {
        super(app);

        this.config = app.get(ConfigService);
    }

    async connectToRedis(): Promise<void> {
        const redisConfig = this.config.get('redis') as Configuration['redis'];
        const pubClient = createClient({
            name: redisConfig.name,
            url: `redis://${redisConfig.host}:${redisConfig.port}`,
            username: redisConfig.username,
            password: redisConfig.password,
            database: redisConfig.database
        });
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.connect(), subClient.connect()]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options) as Server;

        server.adapter(this.adapterConstructor);

        return server;
    }
}
