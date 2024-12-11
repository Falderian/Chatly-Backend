import { BadRequestException, Injectable } from '@nestjs/common';
import { ConversationsService } from '../conversations/conversations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDTO } from './dto/create-message.dto';
import { UpdateMessagesDTO } from './dto/update-messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create({ conversationId, content }: CreateMessageDTO) {
    const conversation =
      await this.conversationsService.findById(conversationId);

    return await this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          conversationId,
          senderId: conversation.senderId,
          content,
        },
      });

      this.notificationsService.notificateUser({
        message: content,
        senderId: conversation.senderId,
        receiverId: conversation.receiverId,
      });

      tx.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: message.createdAt },
      });

      return message;
    });
  }

  async update(id: number, content: string) {
    try {
      return await this.prisma.message.update({
        where: { id },
        data: { content },
      });
    } catch (error) {
      throw new BadRequestException(error.meta.cause);
    }
  }

  async updateMany({ ids, isRead }: UpdateMessagesDTO) {
    try {
      const msgs = await this.prisma.message.findMany({
        where: { id: { in: ids } },
      });
      if (ids.length !== msgs.length)
        throw new Error('Some messages not found');

      await this.prisma.message.updateMany({
        where: { id: { in: ids } },
        data: { isRead },
      });

      return { message: 'Messages have been updated' };
    } catch (error) {
      throw new BadRequestException(error.meta?.cause || error.message);
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.message.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(error.meta.cause);
    }
  }
}
