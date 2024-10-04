import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDTO } from './dto/create-conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async create(@Body() { senderId, receiverId }: CreateConversationDTO) {
    return await this.conversationsService.create(senderId, receiverId);
  }

  @Get()
  async find(@Query('ids') ids: [number, number]) {
    return await this.conversationsService.find(ids);
  }

  @Get('user/:id')
  async findUserConversations(@Param('id') id: number) {
    return await this.conversationsService.findUserConversations(+id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.conversationsService.delete(id);
  }
}
