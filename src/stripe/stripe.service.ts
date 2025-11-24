/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow('STRIPE_SECRET_KEY'));
  }

  async createCheckoutSession(invoiceId: string, amount: number, userId: string) {
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'pkr',
            product_data: {
              name: `Invoice #${invoiceId}`,
            },
            unit_amount: amount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get('FRONTEND_URL')}/user-dashboard?payment=success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/user-dashboard?payment=cancelled`,
      metadata: {
        invoiceId,
        userId,
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async verifyWebhookSignature(payload: string, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.configService.getOrThrow('STRIPE_WEBHOOK_SECRET'),
    );
  }

  /**
   * Retrieve a checkout session by ID
   */
  async retrieveCheckoutSession(sessionId: string) {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }

  /**
   * Get the Stripe instance (for advanced operations)
   */
  getStripeInstance(): Stripe {
    return this.stripe;
  }
}
