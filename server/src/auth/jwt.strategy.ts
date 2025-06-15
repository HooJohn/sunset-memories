import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
// import { ConfigService } from '@nestjs/config'; // If using ConfigService for secret

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersService: UsersService,
    // private readonly configService: ConfigService, // Inject ConfigService if using it for secret
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKey: configService.get<string>('JWT_SECRET'), // Use ConfigService
      secretOrKey: process.env.JWT_SECRET || 'DO_NOT_USE_IN_PROD_SUPER_SECRET_KEY', // Fallback for simplicity
    });
  }

  async validate(payload: any): Promise<{ userId: number; phone: string }> {
    // The payload here is the decoded JWT { phone: user.phone, sub: user.id, iat: ..., exp: ... }
    // We could fetch the full user object from the database if needed for every request
    // const user = await this.usersService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // For this example, we'll just return the essential info from the payload
    // This avoids a database call on every authenticated request if not strictly necessary
    if (!payload || !payload.sub || !payload.phone) {
        throw new UnauthorizedException('Invalid token payload');
    }
    return { userId: payload.sub, phone: payload.phone };
  }
}
