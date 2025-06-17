import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService, // 添加jwtService注入
  ) {}

  async register(registerAuthDto: RegisterAuthDto): Promise<Omit<User, 'password'>> {
    const { phone, password, nickname, name, avatar_url } = registerAuthDto;

    const existingUser = await this.usersService.findOneByPhone(phone);
    if (existingUser) {
      throw new ConflictException('该手机号已被注册');
    }

    const saltRounds = 10;
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch (error) {
      this.logger.error('密码哈希处理错误', error.stack);
      throw new InternalServerErrorException('注册数据处理错误');
    }

    const userToCreate = {
      phone,
      password: hashedPassword,
      nickname,
      name,
      avatar_url,
    };

    let createdUser;
    try {
      createdUser = await this.usersService.create(userToCreate);
    } catch (error) {
      this.logger.error('用户创建失败', error.stack);
      if (error.code === '23505') {
          throw new ConflictException('用户信息已存在');
      }
      throw new InternalServerErrorException('用户创建失败');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = createdUser;
    return result;
  }

  async login(loginAuthDto: LoginAuthDto): Promise<{ access_token: string, user: Omit<User, 'password'> }> {
    const { phone, password } = loginAuthDto;

    const user = await this.validateUser(phone, password);
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    const payload = { phone: user.phone, sub: user.id, nickname: user.nickname };
    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async validateUser(phone: string, password: string): Promise<Omit<User, 'password'> | null> {
    // 获取包含密码的用户信息
    const user = await this.usersService.findOneByPhoneWithPassword(phone);
    
    if (!user) {
      this.logger.warn(`登录尝试：不存在的用户 - ${phone}`);
      return null;
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`密码验证失败 - ${phone}`);
      return null;
    }

    // 移除密码字段返回
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }
}
