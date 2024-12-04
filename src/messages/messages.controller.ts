import { Body, Controller, Param, Post, Put } from '@nestjs/common';
import { CreateMessageDTO } from './dto/create-message.dto';
import { UpdateMessageDTO } from './dto/update-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() dto: CreateMessageDTO) {
    return await this.messagesService.create(dto);
  }

  @Put(':id')
  async update(
    @Param(':id') id: string,
    @Body() { content }: UpdateMessageDTO,
  ) {
    return this.messagesService.update(+id, content);
  }
}
