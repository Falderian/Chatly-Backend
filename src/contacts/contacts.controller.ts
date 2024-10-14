import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get()
  async findUserContacts(@Param('userId') userId: number) {
    return this.contactsService.findUserContacts(userId);
  }

  @Delete(':userId/:contactId')
  async delete(
    @Param('userId') userId: number,
    @Param('contactId') contactId: number,
  ) {
    return this.contactsService.delete(userId, contactId);
  }
}
