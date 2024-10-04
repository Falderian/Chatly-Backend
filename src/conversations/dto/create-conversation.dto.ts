import { Conversation } from '@prisma/client';
import { IsNotEmpty, Min } from 'class-validator';

export class CreateConversationDTO
  implements Pick<Conversation, 'senderId' | 'receiverId'>
{
  @IsNotEmpty()
  @Min(1)
  senderId: number;

  @IsNotEmpty()
  @Min(1)
  receiverId: number;
}
