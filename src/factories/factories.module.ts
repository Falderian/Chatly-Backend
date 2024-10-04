import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [PrismaModule, MessagesModule],
  providers: [FactoriesService],
})
export class FactoriesModule {}
