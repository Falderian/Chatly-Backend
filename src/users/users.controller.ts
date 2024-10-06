import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUsersDto } from './dto/search-users.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query() queryDto: SearchUsersDto) {
    return await this.usersService.search(queryDto.query);
  }

  @Get(':id')
  async findUserById(@Param('id') id: string) {
    return await this.usersService.findOneById(+id);
  }

  @Get('name/:username')
  async Search(@Param('username') username: string) {
    return this.usersService.search(username);
  }
}
