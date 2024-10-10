import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';
import { FactoriesController } from './factories.controller';

@Module({
  imports: [PrismaModule, MessagesModule],
  providers: [FactoriesService],
  controllers: [FactoriesController],
})
export class FactoriesModule {}
