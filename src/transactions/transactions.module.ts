import { Module } from '@nestjs/common';
import { TransactionsController, AdminTransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { PrismaModule } from 'src/prisma.module';
import { StripeModule } from 'src/stripe/stripe.module';

@Module({
  imports: [StripeModule, PrismaModule],
  controllers: [TransactionsController, AdminTransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
