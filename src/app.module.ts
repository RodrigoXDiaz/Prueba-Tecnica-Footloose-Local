import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { FirebaseModule } from '@shared/firebase/firebase.module';
import { AuthModule } from '@modules/auth/auth.module';
import { ProductModule } from '@modules/products/product.module';
import { ServicesModule } from '@modules/services/services.module';
import { NotificationModule } from '@modules/notifications/notification.module';
import { GlobalExceptionFilter } from '@core/filters/global-exception.filter';
import { LoggingInterceptor } from '@core/interceptors/logging.interceptor';
import { TransformInterceptor } from '@core/interceptors/transform.interceptor';
import { FirebaseAuthGuard } from '@shared/guards/firebase-auth.guard';
import { Reflector } from '@nestjs/core';

/**
 * Módulo Principal de la Aplicación
 * Configura módulos globales, guards, filtros e interceptors
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    EventEmitterModule.forRoot(),
    FirebaseModule,

    AuthModule,
    ProductModule,
    ServicesModule,
    NotificationModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: FirebaseAuthGuard,
    },
    Reflector,
  ],
})
export class AppModule {}
