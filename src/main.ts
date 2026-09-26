import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from '#/app.module.js';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {

  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useStaticAssets(join(process.cwd(), 'public'));
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
