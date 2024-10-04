import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { username, email, password, text } from 'casual';
import * as casual from 'casual';

import { MessagesService } from '../messages/messages.service';

@Injectable()
export class FactoriesService {
  skipDuplicates = true;
  limit = 100000;

  constructor(
    private readonly prisma: PrismaService,
    private readonly msgService: MessagesService,
  ) {
    this.createMessages();
  }

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

  async createMessages() {
    const users = await this.prisma.user.findMany({});

    for (let i = 1; i < this.limit; i++) {
      const senderId = casual.random_element(users).id;
      const receiverId = casual.random_element(users).id;

      if (senderId === receiverId) {
        console.log(
          'Skipping message creation because sender and receiver are the same',
        );
        continue;
      }

      const content = text;

      await this.msgService.create({
        senderId,
        receiverId,
        content,
      });

      if (i % 200 === 0) console.log(`Messages created: ${i}`);
    }
  }
}
