import { Module } from '@nestjs/common';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { PrismaModule } from '../prisma/prisma.module';
import { FactoriesController } from './factories.controller';
import { FactoriesService } from './factories.service';

@Module({
  imports: [PrismaModule, MessagesModule, ConversationsModule],
  controllers: [FactoriesController],
  providers: [FactoriesService],
})
export class FactoriesModule {}
