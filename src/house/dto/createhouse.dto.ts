import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateHouseDto {
  @IsString()
  @IsNotEmpty({ message: 'House number is required' })
  houseNo: string;

  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
