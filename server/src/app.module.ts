import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MemoirsModule } from './memoirs/memoirs.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module'; // Already present
import { CollaborationsModule } from './collaborations/collaborations.module'; // Added import

import { User } from './users/entities/user.entity';
import { Memoir } from './memoirs/entities/memoir.entity';
import { Chapter } from './memoirs/entities/chapter.entity';
import { Comment } from './memoirs/entities/comment.entity';
import { Like } from './memoirs/entities/like.entity';
import { MemoirCollaboration } from './memoirs/entities/memoir-collaboration.entity';
import { ServiceRequest } from './service-requests/entities/service-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/sunset_memories',
      entities: [User, Memoir, Chapter, Comment, Like, MemoirCollaboration, ServiceRequest],
      synchronize: true, // Dev only!
      // logging: true,
    }),
    UsersModule,
    AuthModule,
    MemoirsModule,
    ServiceRequestsModule,
    CollaborationsModule, // Added CollaborationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
