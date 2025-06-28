import { Module } from '@nestjs/common';
import { EventsKafkaConsumer } from '../events.kafka.consumer';
import { EventsGateway } from './events.gateway';

// const redisIoAdapter = new RedisIoAdapter(app);
// await redisIoAdapter.connectToRedis();

// app.useWebSocketAdapter(redisIoAdapter);

@Module({
    providers: [EventsGateway],
    controllers: [EventsKafkaConsumer]
})
export class EventsModule {}
