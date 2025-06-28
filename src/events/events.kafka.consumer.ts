import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DomainEvent } from './domain-event';
import { EventsGateway } from './socket-io/events.gateway';

@Controller()
export class EventsKafkaConsumer {
    private readonly logger = new Logger(EventsKafkaConsumer.name);

    constructor(private readonly eventsGateway: EventsGateway) {}

    @MessagePattern('notes.space')
    handleSpaceDomainEvent(@Payload() event: DomainEvent) {
        this.handleDomainEvent(event);
    }

    @MessagePattern('notes.stack')
    handleStackDomainEvent(@Payload() event: DomainEvent) {
        this.handleDomainEvent(event);
    }

    @MessagePattern('notes.notebook')
    handleNotebookDomainEvent(@Payload() event: DomainEvent) {
        this.handleDomainEvent(event);
    }

    @MessagePattern('notes.note')
    handleNoteDomainEvent(@Payload() event: DomainEvent) {
        this.handleDomainEvent(event);
    }

    protected handleDomainEvent(event: DomainEvent) {
        console.log('Received from Kafka:', event);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const userId = event.data.userId! as string;
        const room = `users/${userId}/notes`;

        this.logger.log(`Publishing event to room: ${room}`);
        this.logger.log(`Event data: ${JSON.stringify(event)}`);

        // Publish event to WebSocket client
        this.eventsGateway.publish({ room, payload: event });
    }
}
