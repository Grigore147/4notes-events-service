import { CloudEvent } from '../cloud-event';

type JoinedRoomData = {
    userId: string;
    roomId: string;
};

export class JoinedRoom extends CloudEvent {
    constructor({ userId, roomId }: JoinedRoomData) {
        super({
            type: 'joined-room',
            data: {
                userId,
                roomId
            }
        });
    }
}
