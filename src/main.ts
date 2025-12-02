import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.setGlobalPrefix(configService.get<string>('API_PREFIX') || 'api/v1');
  app.enableCors({
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('Catálogo de Productos API')
    .setDescription(
      'API REST para gestión de catálogo de productos con autenticación y roles',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', 'Endpoints de autenticación y gestión de usuarios')
    .addTag('Products', 'Endpoints de gestión de productos')
    .addTag('Services', 'Servicios adicionales (Excel, PDF, Notificaciones)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  const apiKey = configService.get<string>('FIREBASE_WEB_API_KEY');
  const apiKeyStatus = apiKey && apiKey !== 'AIzaSyDuJ8QYc9xVZqXxK_1234567890abcdefg' 
    ? 'Configurada' 
    : 'NO CONFIGURADA';

  console.log(`\nAplicación iniciada exitosamente`);
  console.log(`Servidor: http://localhost:${port}`);
  console.log(`Swagger: http://localhost:${port}/api/docs`);
  console.log(`Firebase API Key: ${apiKeyStatus}\n`);

  if (!apiKey || apiKey === 'AIzaSyDuJ8QYc9xVZqXxK_1234567890abcdefg') {
    console.warn('ADVERTENCIA: Firebase Web API Key no configurada');
    console.warn('El login y registro NO funcionarán');
  }
}

bootstrap();
