import { Controller, Put } from '@nestjs/common';
import { CounterService } from '../services/counter.service';

@Controller()
export class CounterController {
  constructor(private readonly counterService: CounterService) {}

  @Put('doCounter')
  updateCounter() {
    return this.counterService.updateCounter();
  }
}
