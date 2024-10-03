import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    if (await this.isExists(data)) {
      throw new ConflictException('User already exists');
    }

    return this.prisma.user.create({
      data,
    });
  }

  async isExists({ email, username }: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    return Boolean(existingUser);
  }
}
