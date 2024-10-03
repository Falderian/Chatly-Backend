import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/:username')
  async findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }
}
