import { Controller, Get, Param, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SearchUsersDto } from './dto/search-users.dto';
import { Decorators } from '../decorators/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(@Query() queryDto: SearchUsersDto) {
    return await this.usersService.search(queryDto.query);
  }

  @Get('/:id')
  async findUserById(
    @Param('id') id: string,
    @Decorators.UserId() userId: string,
  ) {
    return await this.usersService.findOneById(+userId);
  }
}
