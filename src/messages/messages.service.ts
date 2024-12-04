import { Injectable } from '@nestjs/common';
import { ConversationsService } from '../conversations/conversations.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDTO } from './dto/create-message.dto';

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

    const message = await this.prisma.message.create({
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

    return message;
  }

  async update(id: number, content: string) {
    return await this.prisma.message.update({
      where: { id },
      data: { content },
    });
  }
}
