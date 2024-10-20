import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDTO } from './dto/create-message.dto';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversationsService: ConversationsService,
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

    return message;
  }

  async update(id: number, content: string) {
    return await this.prisma.message.update({
      where: { id },
      data: { content },
    });
  }
}
