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
  batchSize = 10000;
  logger = new Logger('FactoriesService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly msgService: MessagesService,
    private readonly conversationsService: ConversationsService,
  ) {}

  runFactory = async () => {
    this.logger.log('Starting Factory...');
    await this.createUsers();
    await this.createConversations();
    await this.createContacts();
    await this.createMessages();
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

  async createConversations() {
    this.logger.log('Starting conversation creation process...');

    const users = await this.prisma.user.findMany();
    const userCount = users.length;

    if (userCount < 2) {
      this.logger.error('Not enough users to create conversations.');
      return;
    }

    const minConversationsPerUser = 20;
    const maxConversationsPerUser = 30;

    const allConversations = await this.prisma.conversation.findMany({
      select: {
        senderId: true,
        receiverId: true,
      },
    });

    const conversationMap = new Map<string, boolean>();
    for (const convo of allConversations) {
      const key = `${convo.senderId}-${convo.receiverId}`;
      conversationMap.set(key, true);
    }

    const newConversations: { senderId: number; receiverId: number }[] = [];

    for (const user of users) {
      const existingConversationCount = allConversations.filter(
        (c) => c.senderId === user.id || c.receiverId === user.id,
      ).length;

      if (existingConversationCount >= minConversationsPerUser) {
        continue;
      }

      const conversationCountToCreate = Math.min(
        casual.integer(
          minConversationsPerUser - existingConversationCount,
          maxConversationsPerUser - existingConversationCount,
        ),
        userCount - 1,
      );

      const potentialPartners = users.filter((u) => u.id !== user.id);

      let createdCount = 0;
      while (createdCount < conversationCountToCreate) {
        const receiver = casual.random_element(potentialPartners);

        const key1 = `${user.id}-${receiver.id}`;
        const key2 = `${receiver.id}-${user.id}`;

        if (!conversationMap.has(key1) && !conversationMap.has(key2)) {
          newConversations.push({
            senderId: user.id,
            receiverId: receiver.id,
          });
          conversationMap.set(key1, true);
          createdCount++;
        }
      }
    }

    if (newConversations.length > 0) {
      try {
        await this.prisma.conversation.createMany({
          data: newConversations,
        });
      } catch (error) {
        this.logger.error(`Failed to create conversations: ${error.message}`);
      }
    }

    this.logger.log(
      `Conversation creation process completed. Total Conversations Created: ${newConversations.length}.`,
    );
  }

  async createMessages() {
    this.logger.log('Starting optimized message creation process...');

    const totalMessages = this.limit * 100;
    const batchSize = this.batchSize || 1000;
    const maxParallelBatches = 5;

    const users = await this.prisma.user.findMany({ select: { id: true } });
    const conversations = await this.prisma.conversation.findMany({
      select: { id: true, senderId: true, receiverId: true },
    });

    if (!users.length || !conversations.length) {
      this.logger.error(
        'Not enough users or conversations found to create messages.',
      );
      return;
    }

    const messageData = Array.from({ length: totalMessages }).map(() => {
      const conversation = casual.random_element(conversations);
      const senderId = casual.random_element([
        conversation.senderId,
        conversation.receiverId,
      ]);

      return {
        senderId,
        content: casual.sentence || 'Default message content',
        conversationId: conversation.id,
      };
    });

    const messageBatches = [];
    for (let i = 0; i < messageData.length; i += batchSize) {
      messageBatches.push(messageData.slice(i, i + batchSize));
    }

    let messagesCreated = 0;

    for (let i = 0; i < messageBatches.length; i += maxParallelBatches) {
      const parallelBatches = messageBatches.slice(i, i + maxParallelBatches);

      await Promise.all(
        parallelBatches.map(async (batch) => {
          try {
            await this.prisma.message.createMany({
              data: batch,
              skipDuplicates: true,
            });
            messagesCreated += batch.length;
            this.logger.log(
              `Batch processed. Total Messages Created: ${messagesCreated}`,
            );
          } catch (error) {
            this.logger.error(`Failed to process batch: ${error.message}`);
          }
        }),
      );
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
