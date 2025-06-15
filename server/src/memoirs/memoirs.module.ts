import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoirsService } from './memoirs.service';
import { MemoirsController } from './memoirs.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // Added for UsersService injection
import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { MemoirCollaboration } from './entities/memoir-collaboration.entity'; // Added

@Module({
  imports: [
    TypeOrmModule.forFeature([Memoir, Chapter, MemoirCollaboration]), // Register new entity
    AuthModule,
    UsersModule, // Added UsersModule
  ],
  controllers: [MemoirsController],
  providers: [MemoirsService],
  exports: [MemoirsService], // Export MemoirsService
})
export class MemoirsModule {}
