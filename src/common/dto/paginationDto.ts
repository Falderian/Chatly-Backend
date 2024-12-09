import { IsNumber, Min } from 'class-validator';

export class PaginationDTO {
  @IsNumber()
  @Min(1)
  id: number;

  @IsNumber()
  page = 0;
}
