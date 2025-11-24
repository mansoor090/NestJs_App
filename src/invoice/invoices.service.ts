import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { ProductType } from '@prisma/client';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private readonly DAYS_BEFORE_SURCHARGE = 5;

  constructor(private prisma: PrismaService) {}

  /**
   * Get setting value by ProductType
   */
  private async getSettingByProductType(productType: ProductType): Promise<number> {
    const setting = await this.prisma.settings.findUnique({
      where: { key: productType },
    });
    // Default values based on ProductType
    const defaults = {
      [ProductType.MONTHLY_BILL]: 100,
      [ProductType.LATE_SURCHARGE]: 10,
    };

    return setting ? parseFloat(setting.value) : defaults[productType];
  }

  /**
   * Get monthly bill amount from database settings
   */
  private async getMonthlyBillAmount(): Promise<number> {
    return this.getSettingByProductType(ProductType.MONTHLY_BILL);
  }

  /**
   * Get late surcharge amount from database settings
   */
  private async getLateSurchargeAmount(): Promise<number> {
    return this.getSettingByProductType(ProductType.LATE_SURCHARGE);
  }

  /**
   * Generate monthly invoices for all houses with users
   * Prevents duplicate invoices for the same month
   */
  async generateMonthlyInvoices() {
    this.logger.log('Starting monthly invoice generation...');

    try {
      // Get all houses with users
      const houses = await this.prisma.house.findMany({
        include: {
          user: true,
        },
      });

      if (houses.length === 0) {
        this.logger.log('No houses found. Skipping invoice generation.');
        return;
      }

      const now = new Date();
      // Truncate milliseconds for comparison
      const nowWithoutMs = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
      );
      // For testing: Check for invoices created in the last 2 minutes
      // Subtract 2 minutes (120000 ms) from current time
      // const twoMinutesAgo = new Date(nowWithoutMs.getTime() - 2 * 60 * 1000);
      // twoMinutesAgo.setMilliseconds(0);
      // In production, change to monthly check:
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      let generatedCount = 0;
      let skippedCount = 0;

      for (const house of houses) {
        // Check if invoice already exists in the last 2 minutes (for testing)
        // In production, check for current month instead
        const existingInvoice = await this.prisma.invoice.findFirst({
          where: {
            houseId: house.id,
            createdAt: {
              lte: startOfMonth,
              gte: endOfMonth,
              // gt: twoMinutesAgo,
            },
          },
        });

        if (existingInvoice) {
          this.logger.debug(
            `Invoice already exists for house ${house.houseNo} (${house.id}) in the last 2 minutes. Skipping.`,
          );
          skippedCount++;
          continue;
        }

        // Get monthly bill amount from database
        const monthlyBillAmount = await this.getMonthlyBillAmount();

        // Create invoice with monthly bill item
        await this.prisma.invoice.create({
          data: {
            userId: house.userId,
            houseId: house.id,
            items: {
              create: {
                productType: ProductType.MONTHLY_BILL,
                amount: monthlyBillAmount,
              },
            },
            createdAt: nowWithoutMs,
          },
        });

        generatedCount++;
        this.logger.debug(`Generated invoice for house ${house.houseNo} (${house.id})`);
      }

      this.logger.log(
        `Invoice generation completed. Generated: ${generatedCount}, Skipped: ${skippedCount}`,
      );
    } catch (error) {
      this.logger.error('Error generating monthly invoices:', error);
      throw error;
    }
  }

  /**
   * Add late surcharge to unpaid invoices older than 5 days
   * Example: Invoice created on 1st, today is 6th (5 days passed) → add surcharge
   */
  async addLateSurcharge() {
    this.logger.log('Checking for late surcharges...');

    try {
      // undo for production
      const now = new Date();
      // Set to start of day to compare dates properly
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - this.DAYS_BEFORE_SURCHARGE);
      // Set to end of that day to include invoices created on that day
      cutoffDate.setHours(23, 59, 59, 999);

      // const now = new Date();
      // const nowWithoutMs = new Date(
      //   now.getFullYear(),
      //   now.getMonth(),
      //   now.getDate(),
      //   now.getHours(),
      //   now.getMinutes(),
      //   now.getSeconds(),
      // );

      // const cutoffDate = new Date(nowWithoutMs.getTime() - 1 * 30 * 1000);

      // Find all unpaid invoices created on or before the cutoff date (5+ days ago)
      const unpaidInvoices = await this.prisma.invoice.findMany({
        where: {
          createdAt: {
            lte: cutoffDate, // Created 5+ days ago
          },
          transaction: null, // No transaction means unpaid
        },
        include: {
          items: true,
        },
      });

      let surchargeAddedCount = 0;
      let alreadyHasSurchargeCount = 0;

      for (const invoice of unpaidInvoices) {
        // Check if surcharge already exists
        const hasSurcharge = invoice.items.some(
          (item) => item.productType === ProductType.LATE_SURCHARGE,
        );

        if (hasSurcharge) {
          alreadyHasSurchargeCount++;
          continue;
        }

        // Get late surcharge amount from database
        const lateSurchargeAmount = await this.getLateSurchargeAmount();

        // Add late surcharge item
        await this.prisma.item.create({
          data: {
            invoiceId: invoice.id,
            productType: ProductType.LATE_SURCHARGE,
            amount: lateSurchargeAmount,
          },
        });

        surchargeAddedCount++;
        this.logger.debug(
          `Added late surcharge to invoice ${invoice.id} (House: ${invoice.houseId})`,
        );
      }

      this.logger.log(
        `Late surcharge check completed. Added: ${surchargeAddedCount}, Already had: ${alreadyHasSurchargeCount}`,
      );
    } catch (error) {
      this.logger.error('Error adding late surcharges:', error);
      throw error;
    }
  }

  /**
   * Get all invoices for a specific user
   */
  async getUserInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: {
        userId: userId,
      },
      include: {
        house: {
          select: {
            id: true,
            houseNo: true,
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single invoice by ID (only if it belongs to the user)
   */
  async getInvoiceById(invoiceId: string, userId: string) {
    return this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId,
      },
      include: {
        house: {
          select: {
            id: true,
            houseNo: true,
          },
        },
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        transaction: {
          select: {
            id: true,
            status: true,
            amount: true,
            completedAt: true,
          },
        },
      },
    });
  }
}
