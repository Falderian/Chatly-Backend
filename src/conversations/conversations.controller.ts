import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Decorators } from '../decorators/decorators';
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
  async find(@Query('id') id: string, @Decorators.UserId() senderId: string) {
    return await this.conversationsService.find(+senderId, +id);
  }

  @Get(':id')
  async findByid(@Param('id') id: string, @Query('page') page?: number) {
    return await this.conversationsService.findById(+id, page);
  }

  @Get('user/:id')
  async findUserConversations(@Param('id') id: number) {
    return await this.conversationsService.findUserConversations(+id);
  }

  @Get('messages/:id')
  async findConversationMessages(
    @Param('id') id: string,
    @Query('page') page = 0,
  ) {
    return await this.conversationsService.findConversationMessages(+id, page);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    return await this.conversationsService.delete(id);
  }
}
