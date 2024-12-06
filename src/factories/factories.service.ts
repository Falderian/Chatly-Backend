import { Injectable, Logger } from '@nestjs/common';
import * as casual from 'casual';
import { email, first_name, last_name, password } from 'casual';
import { PrismaService } from '../prisma/prisma.service';

import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

@Injectable()
export class FactoriesService {
  skipDuplicates = true;
  limit = 1000;
  batchSize = 1000;
  logger = new Logger('FactoriesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly msgService: MessagesService,
    private readonly conversationsService: ConversationsService,
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

    const totalMessages = this.limit * 100;
    const batchSize = this.batchSize || 100; // Number of messages per batch
    const userFetchBatchSize = 1000; // Fetch users in smaller batches if user count is large
    let totalUsersProcessed = 0;

    const conversations = await this.prisma.conversation.findMany({});
    if (!conversations.length) {
      this.logger.error('No conversations found. Cannot create messages.');
      return;
    }

    let messagesCreated = 0;

    // Fetch users in chunks to avoid memory issues
    while (true) {
      const users = await this.prisma.user.findMany({
        skip: totalUsersProcessed,
        take: userFetchBatchSize,
      });

      if (!users.length) break;

      totalUsersProcessed += users.length;
      this.logger.log(
        `Fetched ${users.length} users. Total processed: ${totalUsersProcessed}`,
      );

      const totalUserMessages = Math.ceil(
        totalMessages / Math.ceil(6000 / users.length),
      );
      const userMessageTasks = Array.from({ length: totalUserMessages }, () => {
        let senderId: number, receiverId: number;

        do {
          senderId = casual.random_element(users).id;
          receiverId = casual.random_element(users).id;
        } while (senderId === receiverId);

        const content = casual.sentence || 'Default message content';

        return {
          senderId,
          receiverId,
          content,
          conversationId: casual.random_element(conversations).id,
        };
      });

      // Process user messages in batches
      const totalBatches = Math.ceil(userMessageTasks.length / batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const batchStart = batchIndex * batchSize;
        const currentBatch = userMessageTasks.slice(
          batchStart,
          batchStart + batchSize,
        );

        try {
          await Promise.all(
            currentBatch.map(({ conversationId, content }) =>
              this.msgService
                .create({ conversationId, content })
                .then(() => {
                  messagesCreated++;
                })
                .catch((error) => {
                  this.logger.error(
                    `Failed to create message in batch ${batchIndex + 1}: ${error.message}`,
                  );
                }),
            ),
          );
        } catch (error) {
          this.logger.error(
            `Error in batch ${batchIndex + 1}: ${error.message}`,
          );
        }
      }
    }

    this.logger.log(
      `Message creation process completed. Total Messages Created: ${messagesCreated}/${totalMessages}.`,
    );
  }

  async createContacts() {
    this.logger.log('Starting contact creation process...');

    const totalUsers = (await this.prisma.user.count()) / 1000;
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
