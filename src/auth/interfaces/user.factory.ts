import { UserDto } from '../dto/user';
import { User } from '../entities/user';

export interface UserFactoryInterface {
    create(userDto: UserDto): User;
}
