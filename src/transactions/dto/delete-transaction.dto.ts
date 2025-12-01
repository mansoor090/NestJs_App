import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteTransactionDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Transaction ID is required' })
  id: string;
}
