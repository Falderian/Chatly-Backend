import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreateMessageDTO } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async create({ senderId, receiverId, content }: CreateMessageDTO) {
    const ids: [number, number] = [senderId, receiverId];
    const isUsersExists = Boolean(
      (await Promise.all(ids.map((id) => this.usersService.findOneById(id))))
        .length,
    );

    if (!isUsersExists) throw new NotFoundException('No users were found');

    let conversation = await this.prisma.conversation.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          senderId,
          receiverId,
        },
      });
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId,
        content,
      },
    });

    return message;
  }
}
