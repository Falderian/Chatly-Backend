import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { ConversationsModule } from './conversations/conversations.module';
import { FactoriesModule } from './factories/factories.module';
import { MessagesModule } from './messages/messages.module';
import { RequestLoggingMiddleware } from './middlewares/loger-middleware';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    AuthModule,
    ConversationsModule,
    MessagesModule,
    UsersModule,
    FactoriesModule,
    ContactsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
