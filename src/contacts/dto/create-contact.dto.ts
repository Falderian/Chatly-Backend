import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  userId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  contactId: number;
}
