import { Module } from '@nestjs/common';
import { HousesController, UserHousesController } from './houses.controller';
import { PrismaModule } from 'src/prisma.module';
import { HousesService } from './houses.service';

@Module({
  imports: [PrismaModule],
  controllers: [HousesController, UserHousesController],
  providers: [HousesService],
  exports: [HousesService],
})
export class HousesModule {}

