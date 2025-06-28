import { AuthServiceInterface } from '../interfaces/auth.service';
import { UserInterface } from '../interfaces/user.entity';
import { UserDto } from '../dto/user';

type UserCanArgs = {
    action: string;
    resource: string;
    options?: object;
};

export class User implements UserInterface {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        data: UserDto,
        private readonly authService: AuthServiceInterface
    ) {
        Object.assign(this, data);
    }

    can({ action, resource, options = {} }: UserCanArgs): Promise<boolean> {
        return this.authService.userAuthorized(this, action, resource, options);
    }

    public setAccessToken(token: string): this {
        this.accessToken = token;

        return this;
    }

    public toDto(): UserDto {
        return new UserDto({
            id: this.id,
            name: this.name,
            email: this.email,
            accessToken: this.accessToken,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        });
    }
}
