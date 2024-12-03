import { Module } from '@nestjs/common';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [NotificationsModule],
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
