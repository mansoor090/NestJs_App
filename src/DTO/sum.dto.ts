import { IsNumber } from 'class-validator';

export class SumDto {
  @IsNumber()
  a: number;

  @IsNumber()
  b: number;
}
