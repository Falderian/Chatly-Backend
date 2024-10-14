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
    const contacts = await this.prisma.contact.findMany({
      where: {
        userId,
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            lastActivity: true,
          },
        },
      },
      take: 10,
    });

    return contacts.map((contact) => contact.contact);
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
    return Boolean(contact?.id);
  }
}
