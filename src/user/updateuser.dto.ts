import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UpdateuserDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Id is required' })
  id: number;
}
