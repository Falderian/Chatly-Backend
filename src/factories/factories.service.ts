import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { username, email, password } from 'casual';

@Injectable()
export class FactoriesService {
  skipDuplicates = true;
  limit = 100000;

  constructor(private readonly prisma: PrismaService) {}

  createUsers() {
    const data = Array(this.limit)
      .fill(0)
      .map(() => ({
        username,
        email,
        password,
      }));

    this.prisma.user
      .createMany({
        data,
        skipDuplicates: this.skipDuplicates,
      })
      .then(async () =>
        console.log('Users Count =', await this.prisma.user.count()),
      );
  }
}
