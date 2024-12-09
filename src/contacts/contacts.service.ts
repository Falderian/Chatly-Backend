import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateContactDto) {
    const isExists = await this.isUserContact(data.userId, data.contactId);

    if (isExists) throw new ConflictException('Contact already exists');

    const res = await this.prisma.contact.create({
      data,
    });

    return { ...res, isContact: true };
  }

  async findUserContacts(userId: string, page = 0) {
    const contacts = await this.prisma.contact.findMany({
      where: {
        userId: +userId,
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
      skip: page + 10,
    });

    return contacts.map((contact) => contact.contact);
  }

  async delete(userId: number, contactId: number) {
    try {
      await this.prisma.contact.delete({
        where: {
          userId_contactId: {
            userId: userId,
            contactId: contactId,
          },
        },
      });
      return { isContact: false };
    } catch (error) {
      throw new BadRequestException(error.messsage);
    }
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
