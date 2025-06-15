import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto'; // Will create this DTO for user creation if needed by service

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneByPhone(phone: string): Promise<User | undefined> {
    // Query builder to explicitly add password if needed, or rely on specific service methods for auth
    // For general lookup, password should remain excluded by default due to `select: false` in entity.
    return this.userRepository.findOne({ where: { phone } });
  }

  async findOneByPhoneWithPassword(phone: string): Promise<User | undefined> {
    return this.userRepository.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.phone = :phone', { phone })
      .getOne();
  }

  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(createUserDto: Partial<User>): Promise<User> { // Using Partial<User> for flexibility
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  async updateProfile(id: number, updateUserProfileDto: Partial<User>): Promise<User> {
    // `Partial<User>` is used here because UpdateUserProfileDto only defines name and avatar_url
    // but this method could be more generic if needed. For now, it maps directly.
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Update only fields present in DTO
    if (updateUserProfileDto.name !== undefined) {
        user.name = updateUserProfileDto.name;
    }
    if (updateUserProfileDto.avatar_url !== undefined) {
        user.avatar_url = updateUserProfileDto.avatar_url;
    }

    return this.userRepository.save(user);
  }
}
