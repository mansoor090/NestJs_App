// src/transactions/transactions.controller.ts
import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  RawBodyRequest,
  Get,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { StripeService } from '../stripe/stripe.service';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { DeleteTransactionDto } from './dto/delete-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private transactionsService: TransactionsService,
    private stripeService: StripeService,
  ) {}

  @Post('create-session')
  @UseGuards(JwtGuard)
  async createPaymentSession(@Body() body: { invoiceId: string }, @GetUser() user: { id: string }) {
    return this.transactionsService.createPaymentSession(body.invoiceId, user.id);
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new Error('Raw body is required for webhook verification');
    }

    const event = await this.stripeService.verifyWebhookSignature(
      req.rawBody.toString(),
      signature,
    );

    await this.transactionsService.handleWebhook(event);
    return { received: true };
  }
}

@Controller('admin/transactions')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminTransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Get('all')
  async getAll() {
    return this.transactionsService.getAllTransactions();
  }

  @Delete('delete')
  async delete(@Body() dto: DeleteTransactionDto) {
    return this.transactionsService.deleteTransaction(dto.id);
  }

  @Put('update-status')
  async updateStatus(@Body() dto: UpdateTransactionStatusDto) {
    return this.transactionsService.updateTransactionStatus(dto.id, dto.status);
  }
}
