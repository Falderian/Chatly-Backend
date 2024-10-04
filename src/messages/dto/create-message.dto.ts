import { Message } from '@prisma/client';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMessageDTO implements Pick<Message, 'senderId' | 'content'> {
  @IsNotEmpty()
  @Min(1)
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @Min(1)
  @IsNumber()
  senderId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  content: string;
}
