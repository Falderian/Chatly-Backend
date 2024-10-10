import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { first_name, last_name, email, password, text } from 'casual';
import * as casual from 'casual';

import { MessagesService } from '../messages/messages.service';

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

@Injectable()
export class FactoriesService {
  skipDuplicates = true;
  limit = 100000;
  batchSize = 1000;
  logger = new Logger('FactoriesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly msgService: MessagesService,
  ) {}

  runFactory = async () => {
    this.logger.log('Starting Factory...');
    await this.createUsers();
    await this.createMessages();
    await this.createContacts();
    this.logger.log('Factory process completed.');
  };

  async createUsers() {
    this.logger.log('Starting user creation process...');

    const initialCount = await this.prisma.user.count();

    await this.prisma.user.create({
      data: {
        firstName: 'Lilyan',
        lastName: 'Quigley',
        email: 'Xavier_Tromp@yahoo.com',
        password: '5Gloria95',
      },
    });

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

    let usersCreated = 0;
    for (let i = 0; i < batches.length; i++) {
      await this.prisma.user.createMany({
        data: batches[i],
        skipDuplicates: this.skipDuplicates,
      });
      usersCreated += batches[i].length;
      this.logger.log(
        `Users Batch ${i + 1}/${batches.length}: ${usersCreated} users created so far.`,
      );
    }

    const finalCount = await this.prisma.user.count();
    this.logger.log(
      `User creation process completed. Total Users Created: ${finalCount - initialCount}.`,
    );
  }

  async createMessages() {
    this.logger.log('Starting message creation process...');

    const users = await this.prisma.user.findMany({});
    const messagePromises = [];

    let messagesCreated = 0;
    const totalBatches = Math.ceil(this.limit / this.batchSize); // Total number of batches

    for (let i = 1; i <= this.limit; i + 5) {
      const senderId = casual.random_element(users).id;
      const receiverId = casual.random_element(users).id;

      if (senderId === receiverId) {
        this.logger.debug(
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
        messagesCreated += messagePromises.length;

        const currentBatch = Math.ceil(i / this.batchSize);
        this.logger.log(
          `Messages Batch ${currentBatch}/${totalBatches}: ${messagesCreated} messages created so far.`,
        );
        messagePromises.length = 0;
      }
    }

    this.logger.log(
      `Message creation process completed. Total Messages Created: ${messagesCreated}.`,
    );
  }

  async createContacts() {
    this.logger.log('Starting contact creation process...');

    const totalUsers = await this.prisma.user.count();
    const batchSize = this.batchSize;

    let contactsCreated = 0;

    for (let offset = 0; offset < totalUsers; offset += batchSize) {
      const usersBatch = await this.prisma.user.findMany({
        skip: offset,
        take: batchSize,
      });

      const contactPromises = [];

      for (const user of usersBatch) {
        const contacts = getRandomElements(usersBatch, 20).filter(
          (contact) => contact.id !== user.id,
        );

        for (const contact of contacts) {
          contactPromises.push({
            userId: user.id,
            contactId: contact.id,
          });
        }
      }

      if (contactPromises.length > 0) {
        await this.prisma.contact.createMany({
          data: contactPromises,
          skipDuplicates: true,
        });
        contactsCreated += contactPromises.length;
        this.logger.log(
          `Contacts Batch: ${offset / batchSize + 1}/${Math.ceil(totalUsers / batchSize)} - Total Contacts Created: ${contactsCreated}`,
        );
      }
    }

    this.logger.log(
      `Contact creation process completed. Total Contacts Created: ${contactsCreated}.`,
    );
  }
}
