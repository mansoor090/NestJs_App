import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

// ROUTES
import { SumController } from './controllers/sum.controller';
import { SumDto } from './DTO/sum.dto';
import { CounterController } from './controllers/counter.controller';
import { CounterService } from './services/counter.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, SumController, CounterController],
  providers: [AppService, SumDto, CounterService],
})
export class AppModule {}
