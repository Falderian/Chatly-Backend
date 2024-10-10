import { Controller, Get } from '@nestjs/common';
import { FactoriesService } from './factories.service';

@Controller('factories')
export class FactoriesController {
  constructor(private readonly factoriesService: FactoriesService) {}

  @Get('generate')
  generate() {
    this.factoriesService.runFactory();
  }
}
