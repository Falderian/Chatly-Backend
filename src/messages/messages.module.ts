import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ConversationsService } from '../conversations/conversations.service';
import { ContactsService } from '../contacts/contacts.service';

@Module({
  controllers: [MessagesController],
  providers: [
    MessagesService,
    PrismaService,
    UsersService,
    ConversationsService,
    ContactsService,
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
