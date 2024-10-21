import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(senderId: number, receiverId: number) {
    const isUsersExists = Boolean(
      (
        await Promise.all(
          [senderId, receiverId].map((id) => this.usersService.findOneById(id)),
        )
      ).length,
    );

    if (!isUsersExists) throw new NotFoundException(`Users not found`);

    const existingConversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
      include: {
        messages: {
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (existingConversation) return existingConversation;

    return await this.prisma.conversation.create({
      data: {
        senderId,
        receiverId,
      },
    });
  }

  async find(senderId: number, receiverId: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          {
            senderId,
            receiverId,
          },
          {
            senderId: receiverId,
            receiverId: senderId,
          },
        ],
      },
    });

    if (!conversations.length) {
      throw new NotFoundException('No conversations were found');
    }

    return conversations;
  }

  async findById(id: number) {
    return await this.prisma.conversation.findFirstOrThrow({
      where: {
        id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async findUserConversations(id: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ senderId: id }, { receiverId: id }],
      },
      select: {
        id: true,
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
        sender: true,
        receiver: true,
      },
    });

    const conversationsWithMessages = conversations.filter(
      (conversation) => conversation.messages.length > 0,
    );

    return conversationsWithMessages.map((conversation) => {
      const participant =
        conversation.sender.id === id
          ? conversation.receiver
          : conversation.sender;

      const isOwnLastMessage = conversation.messages[0]?.senderId === id;
      const msg = conversation.messages[0];

      return {
        id: conversation.id,
        lastMessage: {
          content: msg.content,
          createdAt: msg.createdAt,
          isRead: msg.isRead,
        },
        isOwnLastMessage,
        participant: {
          id: participant.id,
          firstName: participant.firstName,
          lastName: participant.lastName,
        },
      };
    });
  }

  async delete(id: number) {
    return await this.prisma.conversation.delete({ where: { id } });
  }
}
