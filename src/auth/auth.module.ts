import { Module, NestModule } from '@nestjs/common';

import { AuthService } from './auth.service';
import { UserFactory } from './user.factory';

@Module({
    imports: [],
    controllers: [],
    providers: [AuthService, UserFactory],
    exports: [AuthService, UserFactory]
})
export class AuthModule implements NestModule {
    configure() {
        // ...
    }
}
