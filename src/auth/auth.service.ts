import axios from 'axios';

import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { AuthServiceInterface } from './interfaces/auth.service';
import { UserInterface } from './interfaces/user.entity';
import { UserDto } from './dto/user';

import { UserFactory } from './user.factory';
import { ConfigService } from '@nestjs/config';

type UserData = UserDto & Record<string, any>;

@Injectable()
export class AuthService implements AuthServiceInterface {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly config: ConfigService,
        @Inject(forwardRef(() => UserFactory))
        private readonly userFactory: UserFactory
    ) {}

    async getUserByToken(token: string): Promise<UserInterface | null> {
        const authApiUrl = this.config.get<string>('auth.api.url');

        this.logger.log(`Getting user by token: ${token}`);

        try {
            const response = await axios.get<{ data: UserData }>(
                `${authApiUrl}/users/profile`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const user = this.userFactory.create(
                new UserDto(response.data.data)
            );

            return user.setAccessToken(token);
        } catch (error: unknown) {
            this.logger.error('Error fetching user by token:', error);
            return null;
        }
    }

    async userAuthorized(
        user: UserInterface,
        action: string,
        resource: string,
        options: object = {}
    ): Promise<boolean> {
        const authApiUrl = this.config.get<string>('auth.api.url');

        this.logger.log(`User ID: ${user.id}`);
        this.logger.log(`action: ${action}`);
        this.logger.log(`resource: ${resource}`);
        this.logger.log(`options: ${JSON.stringify(options)}`);

        try {
            const response = await axios.post<{
                data: { authorized: boolean };
            }>(
                `${authApiUrl}/access/authorize`,
                {
                    action: action,
                    resource: resource,
                    options: options
                },
                {
                    headers: {
                        Origin: 'localhost',
                        Authorization: `Bearer ${user.accessToken}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.logger.log('Authorization response:', response.data);

            return response.data?.data?.authorized;
        } catch (error) {
            this.logger.error('Error checking authorization:', error);
            return false;
        }
    }
}
