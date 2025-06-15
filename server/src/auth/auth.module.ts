import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // Will create this next

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }), // Optional: if setting default strategy
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DO_NOT_USE_IN_PROD_SUPER_SECRET_KEY', // Use environment variable for secret
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1d' },
    }),
  ],
  providers: [AuthService, JwtStrategy], // JwtStrategy will be created next
  controllers: [AuthController],
  exports: [AuthService, JwtModule, PassportModule], // Export JwtModule and PassportModule if needed by other modules
})
export class AuthModule {}
