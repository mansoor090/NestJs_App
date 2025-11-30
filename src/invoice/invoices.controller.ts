import { Controller, Get, Param, UseGuards, Req, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { Request } from 'express';

@Controller('user/invoices')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.RESIDENT)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  async getUserInvoices(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('houseNo') houseNo?: string,
    @Query('month') month?: string,
    @Query('itemType') itemType?: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.invoicesService.getUserInvoicesPaginated(userId, {
      page,
      limit,
      houseNo,
      month,
      itemType,
    });
  }

  @Get(':id')
  async getInvoiceById(@Param('id') id: string, @Req() req: Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const userId = (req.user as any).id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.invoicesService.getInvoiceById(id, userId);
  }
}
