import { User } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto implements Pick<User, 'email' | 'password'> {
  @IsOptional()
  @MinLength(3)
  firstName?: string;

  @IsOptional()
  @MinLength(3)
  lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
