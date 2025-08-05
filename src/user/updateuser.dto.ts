import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class UpdateuserDto {
  @IsString()
  @IsNotEmpty({ message: 'name is required' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'email is required' })
  email: string;
}
