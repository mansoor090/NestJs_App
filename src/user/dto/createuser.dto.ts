import { UserRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsStrongPassword()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
