import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create(...ids: number[]) {
    const isUsersExists = Boolean(
      (await Promise.all(ids.map((id) => this.usersService.findOneById(id))))
        .length,
    );

    if (!isUsersExists) throw new NotFoundException(`Users not found`);

    return await this.prisma.conversation.create({
      data: {
        senderId: ids[0],
        receiverId: ids[1],
      },
    });
  }

  async find([senderId, receiverId]: [number, number]) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [
          {
            senderId: senderId,
            receiverId: receiverId,
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

  async findUserConversations(id: number) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ senderId: id }, { receiverId: id }],
      },
      select: { messages: true, id: true },
    });

    return conversations;
  }

  async delete(id: number) {
    return await this.prisma.conversation.delete({ where: { id } });
  }
}
