import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('junaid123')
  getTest(): string {
    return 'Junaid';
  }

  @Get('hello')
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('sum')
  sum(@Query('a') a: string, @Query('b') b: string) {
    const numA = parseInt(a);
    const numB = parseInt(b);

    if (isNaN(numA) || isNaN(numB)) {
      return { error: 'Invalid input' };
    }

    return numA + numB;
  }
}
