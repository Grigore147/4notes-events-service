import { DefaultEventsMap, Socket } from 'socket.io';
import { UserInterface } from 'src/auth/interfaces/user.entity';

interface CustomSocketData {
    user: UserInterface;
}

export class UserSocket extends Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    CustomSocketData
> {
    // ...
}
