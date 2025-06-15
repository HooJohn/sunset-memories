import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerAuthDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
    const { phone, password } = registerAuthDto;

    const existingUser = await this.usersService.findOneByPhone(phone);
    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new InternalServerErrorException('Error hashing password');
    }

    const newUserPartial: Partial<User> = {
      phone,
      password: hashedPassword,
      // name: can be set via a profile update endpoint later
    };

    let createdUser;
    try {
      createdUser = await this.usersService.create(newUserPartial);
    } catch (error) {
      // Log the error internally
      console.error('User creation failed:', error);
      throw new InternalServerErrorException('User could not be created');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = createdUser; // Exclude password from result
    return result;
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ access_token: string }> {
    const { phone, password } = loginAuthDto;
    const user = await this.usersService.findOneByPhoneWithPassword(phone);

    if (!user || !user.password) { // user.password check because it's optional in User entity type
      throw new UnauthorizedException('Invalid credentials (user not found or password not set)');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials (password mismatch)');
    }

    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(phone: string, pass: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findOneByPhoneWithPassword(phone);
    if (user && user.password && await bcrypt.compare(pass, user.password)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
