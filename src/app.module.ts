import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { RequestLoggingMiddleware } from './middlewares/loger-middleware';
import { AuthModule } from './auth/auth.module';
import { FactoriesModule } from './factories/factories.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, FactoriesModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
