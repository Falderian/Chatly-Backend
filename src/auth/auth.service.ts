import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login({ email, password }: CreateUserDto) {
    const user = await this.usersService.findOne(email);

    if (user?.password !== password) throw new UnauthorizedException();

    const payload = { sub: user.id, email: user.email };
    return {
      email,
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
