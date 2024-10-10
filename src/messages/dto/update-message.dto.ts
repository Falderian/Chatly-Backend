import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateMessageDTO {
  @IsNotEmpty()
  @MinLength(2)
  @IsString()
  content: string;
}
