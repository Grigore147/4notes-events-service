import { WsResponse } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';

export class CloudEvent {
    wsEvent: string = 'event';
    specversion: string = '1.0';
    id: string = uuidv4();
    source: string = 'app.4notes.events';
    type: string = 'event';
    subject: string = 'event';
    time: string = new Date().toISOString();
    data: object = {};

    constructor(data: object = {}) {
        Object.assign(this, data);
    }

    toJSON(): object {
        return {
            specversion: this.specversion,
            id: this.id,
            source: this.source,
            type: this.type,
            subject: this.subject,
            time: this.time,
            data: this.data
        };
    }

    toString(): string {
        return JSON.stringify(this.toJSON());
    }

    toWsResponse(): void | WsResponse<object> {
        return {
            event: this.wsEvent,
            data: this.toJSON()
        };
    }
}
