import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
// Import CreateUserDto if usersService.create expects it directly and it's not just Partial<User>
// For now, assuming usersService.create can handle the expanded fields via Partial<User> or specific mapping.
// If usersService.create was updated to CreateUserDto, that would be imported here.

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name); // Added logger

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
    const { phone, password, nickname, name, avatar_url } = registerAuthDto;

    const existingUser = await this.usersService.findOneByPhone(phone);
    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      this.logger.error('Error hashing password during registration', error.stack);
      throw new InternalServerErrorException('Error processing registration data');
    }

    // Construct the DTO for user creation, matching CreateUserDto structure
    // if usersService.create strictly expects it, otherwise Partial<User> is fine
    // if usersService.create itself handles hashing.
    // For now, this service hashes password and usersService.create receives hashed one.
    const userToCreate = {
      phone,
      password: hashedPassword, // Password is now hashed
      nickname, // Pass nickname
      name, // Pass name
      avatar_url, // Pass avatar_url
    };

    let createdUser;
    try {
      // usersService.create now expects CreateUserDto which includes password (plain),
      // so hashing should ideally be inside usersService.create.
      // Re-adjusting: AuthService should NOT hash if usersService.create will.
      // Assuming usersService.create will now handle hashing if it receives a plain password.
      // Let's revert to sending plain password to usersService.create, assuming it's updated.
      createdUser = await this.usersService.create({
          phone: registerAuthDto.phone,
          password: registerAuthDto.password, // Send plain password
          nickname: registerAuthDto.nickname,
          name: registerAuthDto.name,
          avatar_url: registerAuthDto.avatar_url,
      });
    } catch (error) {
      this.logger.error('User creation failed within usersService', error.stack);
      // Check for specific TypeORM or other DB errors if needed
      if (error.code === '23505') { // Example for PostgreSQL unique violation
          throw new ConflictException('A user with these details might already exist.');
      }
      throw new InternalServerErrorException('User could not be created due to an internal error.');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = createdUser;
    return result;
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ access_token: string, user: Omit<User, 'password'> }> {
    const { phone, code } = loginAuthDto; // Changed from password to code

    // The validateUser method now needs to handle 'code' instead of 'password'
    const user = await this.validateUser(phone, code);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials or failed code verification.');
    }

    const payload = { phone: user.phone, sub: user.id, nickname: user.nickname }; // Add nickname to payload
    return {
      access_token: this.jwtService.sign(payload),
      user: user, // Return the user object (without password)
    };
  }

  // Updated to reflect verification code logic (conceptual)
  async validateUser(phone: string, code: string): Promise<Omit<User, 'password'> | null> {
    // For phone login, password is not stored/checked here.
    // User is fetched by phone. Code verification is the primary auth mechanism.
    const user = await this.usersService.findOneByPhone(phone); // Does not fetch password by default

    if (!user) {
      this.logger.warn(`Login attempt for non-existent user with phone: ${phone}`);
      return null;
    }

    // TODO: Implement actual verification code checking logic here.
    // This would involve a separate service (e.g., VerificationCodeService)
    // to generate, store (e.g., in Redis), and verify codes.
    // Example:
    // const isValidCode = await this.verificationCodeService.verify(phone, code);
    // if (!isValidCode) {
    //   this.logger.warn(`Invalid verification code attempt for user: ${phone}`);
    //   return null;
    // }

    // Placeholder/Bypass for development ONLY if code is a specific value (e.g., "000000")
    // REMOVE THIS IN PRODUCTION
    if (code === "000000") {
        this.logger.warn(`Verification code bypassed for user ${phone} with development code.`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user; // password field might not exist on user if not set
        return result as Omit<User, 'password'>;
    } else {
        // Simulate actual code check failure if not the bypass code
        this.logger.warn(`Invalid verification code attempt for user: ${phone}. Code used: ${code}`);
        // For now, if it's not the bypass, let it fail by returning null,
        // as if the (not-yet-implemented) verificationCodeService.verify returned false.
        // When real code verification is added, this entire else block would be removed.
        return null;
    }

    // If actual code verification was implemented and successful:
    // this.logger.log(`User ${phone} successfully validated with verification code.`);
    // const { password, ...result } = user;
    // return result;
  }
}
