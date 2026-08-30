import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from '#/app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.js';

async function bootstrap() {

  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useLogger(logger);
  const port = app.get(ConfigService).getOrThrow<number>("PORT");
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
