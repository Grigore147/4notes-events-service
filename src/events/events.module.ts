import { Module, NestModule } from '@nestjs/common';
import { EventsKafkaConsumer } from './events.kafka.consumer';
import { EventsGateway } from './socket-io/events.gateway';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [EventsKafkaConsumer],
    providers: [EventsGateway]
})
export class EventsModule implements NestModule {
    configure() {
        // ...
    }
}
