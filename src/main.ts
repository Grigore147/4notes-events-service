import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConsoleLogger } from '@nestjs/common';
import { RedisIoAdapter } from './events/socket-io/adapters/redis-adapter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        snapshot: true,
        logger: new ConsoleLogger({
            json: true
        })
    });
    const config = app.get(ConfigService);
    const redisIoAdapter = new RedisIoAdapter(app);

    await redisIoAdapter.connectToRedis();

    app.useWebSocketAdapter(redisIoAdapter);

    app.connectMicroservice<MicroserviceOptions>(
        {
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: config.get('kafka.clientId') as string,
                    brokers: config.get('kafka.brokers') as string[]
                },
                consumer: {
                    groupId: config.get('kafka.groupId') as string
                }
            }
        },
        {
            inheritAppConfig: true
        }
    );

    await app.startAllMicroservices();
    await app.listen(config.get('app.port') as number);
}

void bootstrap();
