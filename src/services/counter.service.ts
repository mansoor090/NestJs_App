import { Injectable } from '@nestjs/common';

@Injectable()
export class CounterService {
  private a: number = 1;
  private b: number = 1000;

  updateCounter() {
    this.a += 1;
    this.b -= 1;

    return {
      a: this.a,
      b: this.b,
    };
  }
}
