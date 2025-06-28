import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from './entities/user';
import { UserDto } from './dto/user';
import { AuthServiceInterface } from './interfaces/auth.service';
import { AuthService } from './auth.service';

@Injectable()
export class UserFactory {
    constructor(
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthServiceInterface
    ) {}

    create(userDto: UserDto): User {
        return new User(userDto, this.authService);
    }
}
