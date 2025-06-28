import { CloudEvent } from '../cloud-event';

type PingData = {
    data: object;
};

export class Ping extends CloudEvent {
    constructor({ data = {} }: PingData) {
        super({
            type: 'ping',
            data: data
        });
    }
}
