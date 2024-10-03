import { Module } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [FactoriesService],
})
export class FactoriesModule {}
