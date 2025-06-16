import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoirsService } from './memoirs.service';
import { MemoirsController } from './memoirs.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity'; // Import Like entity
import { MemoirCollaboration } from './entities/memoir-collaboration.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Memoir, Chapter, Comment, Like, MemoirCollaboration]), // Add Like entity
    AuthModule,
    UsersModule,
  ],
  controllers: [MemoirsController],
  providers: [MemoirsService],
  exports: [MemoirsService], // Export MemoirsService
})
export class MemoirsModule {}
