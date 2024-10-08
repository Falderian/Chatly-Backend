import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { first_name, last_name, email, password, text } from 'casual';
import * as casual from 'casual';

import { MessagesService } from '../messages/messages.service';

@Injectable()
export class FactoriesService {
  skipDuplicates = true;
  limit = 100000;
  batchSize = 5000;
  Loger = new Logger('FactoriesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly msgService: MessagesService,
  ) {}

  async createUsers() {
    const data = Array(this.limit)
      .fill(0)
      .map(() => ({
        firstName: first_name,
        lastName: last_name,
        email,
        password,
      }));

    const batches = [];

    for (let i = 0; i < data.length; i += this.batchSize) {
      batches.push(data.slice(i, i + this.batchSize));
    }

    for (const batch of batches) {
      await this.prisma.user.createMany({
        data: batch,
        skipDuplicates: this.skipDuplicates,
      });
    }

    Logger.log('Users Count =', await this.prisma.user.count());
  }

  async createMessages() {
    const users = await this.prisma.user.findMany({});
    const messagePromises = [];
    for (let i = 1; i <= this.limit; i++) {
      const senderId = casual.random_element(users).id;
      const receiverId = casual.random_element(users).id;

      if (senderId === receiverId) {
        Logger.debug(
          'Skipping message creation because sender and receiver are the same',
        );
        continue;
      }

      const content = text;

      messagePromises.push(
        this.msgService.create({
          senderId,
          receiverId,
          content,
        }),
      );

      if (i % this.batchSize === 0 || i === this.limit) {
        await Promise.all(messagePromises);

        messagePromises.length = 0;

        Logger.debug(`Messages created: ${i}`);
      }
    }
  }
}
