import { UserDto } from '../dto/user';

export interface UserInterface {
    id: string;
    name: string;
    email: string;
    accessToken: string;
    createdAt: Date;
    updatedAt: Date;

    /**
     * Checks if the user has permission to perform a specific action.
     *
     * @param action - The action to check permission for.
     * @param params - Additional parameters for the action.
     *
     * @returns A promise that resolves to true if the user has permission, false otherwise.
     */
    can({
        action,
        resource,
        options
    }: {
        action: string;
        resource: string;
        options?: object;
    }): Promise<boolean>;

    toDto(): UserDto;
}
