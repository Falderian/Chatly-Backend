import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchUsersDto } from './dto/search-users.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query() queryDto: SearchUsersDto) {
    return await this.usersService.search(queryDto.query, +queryDto.page);
  }

  @Get('/:id')
  async findUserById(@Param('id') id: string) {
    return await this.usersService.findOneById(+id);
  }
}
