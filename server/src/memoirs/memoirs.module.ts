import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoirsService } from './memoirs.service';
import { MemoirsController } from './memoirs.controller';
import { AuthModule } from '../auth/auth.module';
import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
// import { UsersModule } from '../users/users.module'; // Only if direct User entity interaction is needed beyond userId

@Module({
  imports: [
    TypeOrmModule.forFeature([Memoir, Chapter]), // Register entities
    AuthModule, // To make JwtAuthGuard available
    // UsersModule, // If you were to inject UsersService or User repository directly
  ],
  controllers: [MemoirsController],
  providers: [MemoirsService],
  // exports: [MemoirsService], // If other modules need to use MemoirsService
})
export class MemoirsModule {}
