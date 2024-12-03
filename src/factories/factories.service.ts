import { Injectable, Logger } from '@nestjs/common';
import * as casual from 'casual';
import { email, first_name, last_name, password, text } from 'casual';
import { PrismaService } from '../prisma/prisma.service';

import { MessagesService } from '../messages/messages.service';

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

@Injectable()
export class FactoriesService {
  skipDuplicates = true;
  limit = 1000;
  batchSize = 100;
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

    this.prisma.user
      .create({
        data: {
          firstName: 'Lilyan',
          lastName: 'Quigley',
          email: 'Xavier_Tromp@yahoo.com',
          password: '5Gloria95',
        },
      })
      .catch((e) => e);

    const data = Array(this.limit)
      .fill(null)
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
    this.logger.log('Starting optimized message creation process...');

    const users = await this.prisma.user.findMany({});
    if (!users.length) {
      this.logger.error('No users found. Cannot create messages.');
      return;
    }
    this.logger.log(`Fetched ${users.length} users.`);

    const totalMessages = this.limit * 10;
    const batchSize = this.batchSize || 100;
    const totalBatches = Math.ceil(totalMessages / batchSize);

    const messageTasks = [];
    for (let i = 0; i < totalMessages; i++) {
      let senderId: number, receiverId: number;

      do {
        senderId = casual.random_element(users).id;
        receiverId = casual.random_element(users).id;
      } while (senderId === receiverId);

      messageTasks.push({
        senderId,
        receiverId,
        content: text || 'Default message content',
      });
    }

    let messagesCreated = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batchStart = batchIndex * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, messageTasks.length);

      const currentBatch = messageTasks.slice(batchStart, batchEnd);
      this.logger.log(
        `Processing batch ${batchIndex + 1}/${totalBatches} (${currentBatch.length} messages)...`,
      );

      try {
        await Promise.all(
          currentBatch.map(({ senderId, receiverId, content }) =>
            this.msgService
              .create({ senderId, receiverId, content })
              .catch((error) => {
                this.logger.error(`Failed to create message: ${error.message}`);
              }),
          ),
        );
        messagesCreated += currentBatch.length;
        this.logger.log(
          `Batch ${batchIndex + 1} completed. Total messages created so far: ${messagesCreated}`,
        );
      } catch (error) {
        this.logger.error(`Error in batch ${batchIndex + 1}: ${error.message}`);
      }
    }

    this.logger.log(
      `Message creation process completed. Total Messages Created: ${messagesCreated}/${totalMessages}.`,
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
