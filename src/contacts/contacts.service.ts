import { ConflictException, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateContactDto) {
    const isExists = await this.isUserContact(data.userId, data.contactId);
    console.log(data, isExists);
    if (isExists) throw new ConflictException('Contact already exists');

    return this.prisma.contact.create({
      data,
    });
  }

  async findUserContacts(userId: number) {
    return this.prisma.contact.findMany({
      where: {
        userId,
      },
    });
  }

  async delete(userId: number, contactId: number) {
    return this.prisma.contact.delete({
      where: {
        userId_contactId: {
          userId: userId,
          contactId: contactId,
        },
      },
    });
  }

  async isUserContact(userId: number, contactId: number) {
    const contact = await this.prisma.contact.findFirst({
      where: {
        userId,
        contactId,
      },
    });
    console.log(userId, contactId, contact);
    return Boolean(contact?.id);
  }
}
