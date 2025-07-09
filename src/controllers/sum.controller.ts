import { Body, Controller, Post } from '@nestjs/common';
import { SumDto } from '../DTO/sum.dto';

@Controller()
export class SumController {
  @Post('doSum')
  calculate(@Body() sumDto: SumDto) {
    const { a, b } = sumDto;
    return { sum: a + b };
  }
}
