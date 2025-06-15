import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

// Import feature modules here later (e.g., UsersModule, MemoirsModule)
// import { UsersModule } from './users/users.module';
// import { MemoirsModule } from './memoirs/memoirs.module';
// import { AuthModule } from './auth/auth.module';
// import { CommunityModule } from './community/community.module';
// import { PublishingModule } from './publishing/publishing.module';
// import { AssistanceModule } from './assistance/assistance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Specify your .env file path
    }),
    // UsersModule,
    // MemoirsModule,
    // AuthModule,
    // CommunityModule,
    // PublishingModule,
    // AssistanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
