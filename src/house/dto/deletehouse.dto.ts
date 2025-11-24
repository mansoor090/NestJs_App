import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteHouseDto {
  @IsUUID()
  @IsNotEmpty({ message: 'House ID is required' })
  id: string;
}
