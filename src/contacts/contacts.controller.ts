import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    return this.contactsService.create(createContactDto);
  }

  @Get('user')
  async findUserContacts(@Query('id') id: string) {
    return this.contactsService.findUserContacts(id);
  }

  @Get('is-contact')
  async isUserContact(
    @Query('userId') userId: string,
    @Query('contactId') contactId: string,
  ) {
    console.log('isUserContact called with:', userId, contactId);
    return await this.contactsService.isUserContact(+userId, +contactId);
  }

  @Delete(':userId/:contactId')
  async delete(
    @Param('userId') userId: string,
    @Param('contactId') contactId: string,
  ) {
    return this.contactsService.delete(+userId, +contactId);
  }
}
