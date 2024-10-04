import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({ username, password }: Omit<CreateUserDto, 'email'>) {
    const user = await this.usersService.findOne(username);
    if (user?.password !== password) throw new UnauthorizedException();

    const payload = { sub: user.id, username: user.username };
    return {
      username,
      id: user.id,
      email: user.email,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
