import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config'; // Example for later use

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away any properties that don't have any decorators
      forbidNonWhitelisted: true, // Instead of stripping, throw an error
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allows for implicit type conversion based on TS type
      },
    }),
  );

  // Example: Access config service if needed for port or other settings
  // const configService = app.get(ConfigService);
  // const port = configService.get<number>('PORT') || 3001;
  const port = process.env.PORT || 3001; // Simple port setup for now

  // Enable CORS if your client is on a different origin
  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Adjust as needed
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix (e.g., /api/v1) - Uncomment if you want all routes prefixed
  app.setGlobalPrefix('api'); // Set global prefix for all routes

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API documentation (if Swagger is setup) might be at ${await app.getUrl()}/api-docs`);
}
bootstrap();
