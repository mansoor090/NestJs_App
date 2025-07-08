import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SumController } from './sum.controller';
import { SumDto } from './DTO/sum.dto';

@Module({
  imports: [],
  controllers: [AppController, SumController],
  providers: [AppService, SumDto],
})
export class AppModule {}
