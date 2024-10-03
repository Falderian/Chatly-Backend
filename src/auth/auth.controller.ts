import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { Public } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() dto: Omit<CreateUserDto, 'email'>) {
    return await this.authService.login(dto);
  }

  @Public()
  @Post('register')
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.create(dto);
  }
}
