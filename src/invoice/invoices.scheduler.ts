import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoicesService } from './invoices.service';

@Injectable()
export class InvoicesScheduler {
  private readonly logger = new Logger(InvoicesScheduler.name);

  constructor(private invoicesService: InvoicesService) {}

  /**
   * Run every 1st of every month for testing
   * In production, change to: @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async handleInvoiceGeneration() {
    this.logger.log('Running scheduled invoice generation...');
    try {
      await this.invoicesService.generateMonthlyInvoices();
      this.logger.log('Scheduled invoice generation completed successfully');
    } catch (error) {
      this.logger.error('Error in scheduled invoice generation:', error);
    }
  }

  @Cron('0 0 10 * *')
  async handlePendingBillSurcharge() {
    this.logger.log('Running scheduled Surcharge generation...');
    try {
      await this.invoicesService.addLateSurcharge();
      this.logger.log('Surcharge generation completed successfully');
    } catch (error) {
      this.logger.error('Error in scheduled surcharged process:', error);
    }
  }
}
