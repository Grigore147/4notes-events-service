import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';

import config from './config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [config]
        }),
        EventEmitterModule.forRoot(),
        DevtoolsModule.register({
            http: process.env.NODE_ENV === 'local'
        }),
        AuthModule,
        EventsModule
    ],
    controllers: [AppController, HealthController],
    providers: [AppService],
    exports: []
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes(HealthController);
    }
}
