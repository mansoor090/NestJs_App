// src/transactions/transactions.controller.ts
import { Controller, Post, Body, Req, Headers, RawBodyRequest } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { StripeService } from '../stripe/stripe.service';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private transactionsService: TransactionsService,
    private stripeService: StripeService,
  ) {}

  @Post('create-session')
  @UseGuards(JwtGuard)
  async createPaymentSession(@Body() body: { invoiceId: string }, @GetUser() user: any) {
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
