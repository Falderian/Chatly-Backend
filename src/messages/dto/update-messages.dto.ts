import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMessagesDTO {
  @IsArray()
  @ArrayMinSize(1)
  ids: number[];

  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;
}
