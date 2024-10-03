import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.SERVER_PORT);

  app.getUrl().then((url) => Logger.verbose(`Server is running on ${url}`));
}
bootstrap();
