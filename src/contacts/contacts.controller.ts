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

  @Get(':id')
  async findUserContacts(@Param('id') userId: string) {
    return this.contactsService.findUserContacts(+userId);
  }

  @Delete(':userId/:contactId')
  async delete(
    @Param('userId') userId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.contactsService.delete(+userId, +contactId);
  }
}
