import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UpdateHouseDto {
  @IsUUID()
  @IsNotEmpty({ message: 'House ID is required' })
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'House number is required' })
  houseNo: string;

  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
