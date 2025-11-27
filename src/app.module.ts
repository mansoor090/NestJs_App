import { StripeModule } from './stripe/stripe.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// ROUTES

//Modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { PrismaModule } from './prisma.module';
import { TransactionsModule } from './transactions/transactions.module';
import { HousesModule } from './house/houses.module';
import { InvoicesModule } from './invoice/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.production',
    }),
    ScheduleModule.forRoot(),
    StripeModule,
    AuthModule,
    UsersModule,
    TransactionsModule,
    PrismaModule,
    HousesModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
