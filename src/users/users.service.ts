import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findOne(username: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findOneById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async search(username: string) {
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          contains: username,
        },
      },
    });

    if (!users.length) throw new NotFoundException('No users were founded');
    return users;
  }
}
