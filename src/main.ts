import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Works with ClassValidator Library (Provided IsNumber Decorator),
  // Pipe -> Validates Input then pass to -> Controller
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3004);
}
bootstrap();
