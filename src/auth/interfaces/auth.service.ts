import { UserInterface } from './user.entity';

export interface AuthServiceInterface {
    getUserByToken(token: string): Promise<UserInterface | null>;
    userAuthorized(
        user: any,
        action: string,
        resource: string,
        options: object
    ): Promise<boolean>;
}
