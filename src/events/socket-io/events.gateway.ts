/* eslint-disable prettier/prettier */
import { forwardRef, Inject, Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
    WsResponse
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { AuthService } from 'src/auth/auth.service';
import { JoinedRoom } from '../events/joined-room';
import { UserSocket } from './user-socket';
import { Ping } from '../events/ping';
import { AuthServiceInterface } from 'src/auth/interfaces/auth.service';

@WebSocketGateway({
    namespace: 'events',
    cors: {
        origin: '*',
        credentials: true
    }
})
export class EventsGateway implements OnGatewayInit<Server>, OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(EventsGateway.name);
    
    @WebSocketServer() server = new Server();

    constructor(
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthServiceInterface
    ) {}

    afterInit(server: Server): void {
        this.logger.log('WebSocket server initialized');

        server.use((socket: UserSocket, next) => {
            this.logger.log('New socket connection attempt');
            this.logger.log(`Socket ID: ${socket.id}`);
            this.logger.log(`Socket handshake: ${JSON.stringify(socket.handshake)}`);

            const accessToken = this.getAccessToken(socket);

            if (!accessToken) {
                return next(new WsException('No access token provided'));
            }

            this.authService.getUserByToken(accessToken)
                .then(user => {
                    if (!user) {
                        return next(new WsException('Invalid access token'));
                    }

                    socket.data.user = user;
                    
                    next();
                })
                .catch(error => {
                    this.logger.error('Error fetching user by token:', error);

                    return next(new WsException('Authentication failed'));
                });
        });
    }

    /**
     * Get the access token from the socket handshake or bearer header.
     * 
     * @param socket 
     */
    getAccessToken(socket: UserSocket): string {
        let accessToken = socket.handshake.auth.token as string;

        if (!accessToken) {
            const authHeader = socket.handshake.headers.authorization as string;

            if (authHeader?.startsWith('Bearer ')) {
                accessToken = authHeader.substring(7);
            }
        }

        if (!accessToken) {
            this.logger.error('No access token provided');

            throw new WsException('No access token provided');
        }

        return accessToken;
    }

    handleConnection(socket: UserSocket, ...args: any[]): void {
        this.logger.log(`User connected: ${socket.data.user.id}`);
        this.logger.log(`Socket ID: ${socket.id}`);
        this.logger.log(`Connection args: ${JSON.stringify(args)}`);

        setInterval(() => {
            this.server.to(socket.id).emit('event', 
                (new Ping({ data: { user: socket.data.user.toDto() } })).toJSON()
            );
        }, 10000);
    }

    handleDisconnect(socket: UserSocket): void {
        this.logger.log(`User disconnected: ${socket.data.user.id}`);
        this.logger.log(`Socket ID: ${socket.id}`);
    }

    @SubscribeMessage('join')
    async handleJoin(
        @ConnectedSocket() socket: UserSocket,
        @MessageBody() room: string
    ): Promise<void | WsResponse<object>> {
        const user = socket.data.user;
        const isAuthorized = await user.can({ action: 'events.join-room', resource: room });

        if (!isAuthorized) {
            this.logger.error(`User ${user.id} is not authorized to join room ${room}`);

            throw new WsException('Unauthorized');
        }

        await socket.join(room);

        this.logger.log(`User ${user.id} joined room ${room}`);
        this.logger.log(`Socket ID: ${socket.id}`);

        return (new JoinedRoom({ userId: user.id, roomId: room })).toWsResponse();
    }

    publish({ socket, room='default', event='event', payload={} }: {
        socket?: UserSocket;
        room?: string;
        event?: string;
        payload?: object;
    }) {
        (socket ? this.server.to(socket.id) : this.server.in(room)).emit(event, payload);
    }
}
