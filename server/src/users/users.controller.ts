import {
  Controller,
  Get,
  Patch, // Added
  Req,
  UseGuards,
  NotFoundException,
  Body, // Added
  UsePipes, // Added
  ValidationPipe, // Added
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from './entities/user.entity';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto'; // Added
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

  @Patch('me')
  @UseGuards(JwtAuthGuard) // Added JwtAuthGuard here as well for consistency, though UsersController could be globally guarded
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, skipMissingProperties: true }))
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<Omit<User, 'password'>> {
    const updatedUser = await this.usersService.updateProfile(req.user.userId, updateUserProfileDto);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = updatedUser;
    return result;
  }
}
