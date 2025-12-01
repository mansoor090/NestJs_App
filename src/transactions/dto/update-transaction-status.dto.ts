import { IsNotEmpty, IsUUID, IsEnum } from 'class-validator';
import { TransactionStatus } from '@prisma/client';

export class UpdateTransactionStatusDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Transaction ID is required' })
  id: string;

  @IsEnum(TransactionStatus)
  @IsNotEmpty({ message: 'Status is required' })
  status: TransactionStatus;
}
