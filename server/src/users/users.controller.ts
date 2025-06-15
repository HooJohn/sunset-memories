import { Controller, Get, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Corrected path
import { User } from './entities/user.entity';
import { Request } from 'express';

// Define a type for the user property on the Express Request object
interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    phone: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthenticatedRequest): Promise<Omit<User, 'password'>> {
    const userId = req.user.userId;
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user; // Ensure password is not returned
    return result;
  }
}
