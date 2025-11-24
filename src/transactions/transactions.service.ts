import { Injectable } from '@nestjs/common';
import { debug } from 'node:console';
import { PrismaService } from 'src/prisma.service';
import { StripeService } from 'src/stripe/stripe.service';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private stripeService: StripeService,
  ) {}

  async createPaymentSession(invoiceId: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
      include: {
        transaction: true,
        items: true,
      },
    });

    if (!invoice || invoice.userId !== userId) {
      throw new Error('Invoice not found');
    }

    // Check if already paid
    if (invoice.transaction?.status === 'COMPLETED') {
      throw new Error('Invoice already paid');
    }

    // Calculate total
    const total = invoice.items.reduce((sum, item) => sum + item.amount, 0);
    console.log('Total Amount' + total);

    // Check if there's an existing transaction with a session ID
    if (invoice.transaction?.stripeSessionId) {
      try {
        // Try to retrieve the existing session
        const existingSession = await this.stripeService.retrieveCheckoutSession(
          invoice.transaction.stripeSessionId,
        );

        // Check if session is still active (open status means user can still complete payment)
        if (existingSession.status === 'open') {
          // Session is still active, return existing URL
          return {
            sessionId: existingSession.id,
            url: existingSession.url,
            isResumed: true,
            message: 'Resuming existing payment session',
          };
        } else if (existingSession.status === 'complete') {
          // Session was completed but our DB might not be updated yet
          // This could happen if webhook hasn't fired yet
          throw new Error('Payment session already completed');
        }
        // If session is expired or closed, we'll create a new one below
      } catch (error) {
        // Session doesn't exist or is invalid, create new one
        console.log('Existing session not found or invalid, creating new one');
      }
    }

    // Create new Stripe checkout session
    const session = await this.stripeService.createCheckoutSession(invoiceId, total, userId);

    // Create or update transaction with session ID
    await this.prisma.transaction.upsert({
      where: { invoiceId },
      create: {
        userId,
        invoiceId,
        status: 'PENDING',
        amount: total,
        stripeSessionId: session.id,
      },
      update: {
        status: 'PENDING',
        amount: total,
        stripeSessionId: session.id,
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
      isResumed: false,
    };
  }

  async handleWebhook(event: any) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const invoiceId = session.metadata.invoiceId;
      console.log('I was here');
      // Update transaction status
      await this.prisma.transaction.update({
        where: { invoiceId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }
  }
}
