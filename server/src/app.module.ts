import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MemoirsModule } from './memoirs/memoirs.module'; // Added import for MemoirsModule

import { User } from './users/entities/user.entity';
import { Memoir } from './memoirs/entities/memoir.entity'; // Added import for Memoir
import { Chapter } from './memoirs/entities/chapter.entity'; // Added import for Chapter

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [User, Memoir, Chapter],
      synchronize: true, // Dev only!
      // logging: true,
    }),
    UsersModule,
    AuthModule,
    MemoirsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
