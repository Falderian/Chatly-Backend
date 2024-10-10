import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MessagesModule } from '../messages/messages.module';
import { FactoriesController } from './factories.controller';

@Module({
  imports: [PrismaModule, MessagesModule],
  controllers: [FactoriesController],
  providers: [FactoriesService],
})
export class FactoriesModule {}
