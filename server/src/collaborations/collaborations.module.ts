import { Module } from '@nestjs/common';
import { CollaborationsController } from './collaborations.controller';
import { MemoirsModule } from '../memoirs/memoirs.module'; // To access MemoirsService
import { AuthModule } from '../auth/auth.module'; // For JwtAuthGuard

@Module({
  imports: [
    AuthModule, // For JwtAuthGuard
    MemoirsModule, // Provides MemoirsService which contains collaboration logic
                  // This avoids circular dependency if MemoirsService also needs UsersService
                  // and CollaborationsService (if it existed) needed UsersService too.
                  // For now, collaboration logic is within MemoirsService.
  ],
  controllers: [CollaborationsController],
  providers: [], // No new providers specific to this module for now
})
export class CollaborationsModule {}
