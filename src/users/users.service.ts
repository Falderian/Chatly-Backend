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

    return this.prisma.user.create({ data });
  }

  async isExists({ email }: CreateUserDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }],
      },
    });

    return Boolean(existingUser);
  }

  async findOne(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findOneById(userId: number, id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: {
        contactOf: {
          where: {
            userId,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    delete user.password;

    const isContact = Boolean(user.contactOf.length);

    return {
      ...user,
      isContact,
    };
  }

  async search(query: string) {
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: query,
            },
          },
          {
            lastName: {
              contains: query,
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        lastActivity: true,
      },
      take: 50,
    });

    return users;
  }
}
