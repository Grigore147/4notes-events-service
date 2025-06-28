export class UserDto {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: Partial<UserDto>) {
        Object.assign(this, data);
    }
}
