import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import  CookieParser from "cookie-parser"
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(CookieParser())
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
