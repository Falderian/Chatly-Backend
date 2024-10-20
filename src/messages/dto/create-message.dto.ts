import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMessageDTO {
  @IsNotEmpty()
  @Min(1)
  @IsNumber()
  conversationId: number;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  content: string;
}
