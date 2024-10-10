import { Controller, Get } from '@nestjs/common';
import { FactoriesService } from './factories.service';
import { Public } from '../auth/auth.decorator';

@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @Get('generate')
  @Public()
  generate() {
    this.factoriesService.runFactory();
  }
}
