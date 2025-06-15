import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { ConfigService } from '@nestjs/config'; // Example for later use

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Global prefix (e.g., /api/v1)
  // app.setGlobalPrefix('api/v1');

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
