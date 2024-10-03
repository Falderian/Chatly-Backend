import { IsString, Length } from 'class-validator';

export class SearchUsersDto {
  @IsString()
  @Length(3)
  query: string;
}
