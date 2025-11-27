import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, raw } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use('/transactions/webhook', raw({ type: 'application/json' }), (req, res, next) => {
    // Copy req.body (Buffer) to req.rawBody for NestJS RawBodyRequest compatibility
    if (req.body instanceof Buffer) {
      req.rawBody = req.body;
    }
    next();
  });
  // Regular JSON parsing for all other routes
  app.use(json());

  app.enableCors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://124.29.217.48:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
  });

  // Works with ClassValidator Library (Provided IsNumber Decorator),
  // Pipe -> Validates Input then pass to -> Controller
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
