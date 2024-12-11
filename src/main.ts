import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as localtunnel from 'localtunnel';
import { AppModule } from './app.module';

async function bootstrap() {
  const DEV_MODE = process.env.NODE_ENV === 'dev';

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const port = Number(process.env.PORT || 3000);

  await app.listen(port, '0.0.0.0');

  let tunnel: string | localtunnel.Tunnel;

  if (DEV_MODE) {
    tunnel = await localtunnel({
      port,
      subdomain: 'chatly-api',
    });
  }

  app
    .getUrl()
    .then((url) =>
      Logger.verbose(
        `Server is running on ${(tunnel as localtunnel.Tunnel)?.url || url}`,
      ),
    );
}
bootstrap();
