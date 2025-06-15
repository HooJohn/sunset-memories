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

  // Example: Update user details (e.g., name, avatar)
  // async update(id: number, updateUserDto: Partial<User>): Promise<User> {
  //   const user = await this.findById(id);
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${id} not found`);
  //   }
  //   Object.assign(user, updateUserDto);
  //   return this.userRepository.save(user);
  // }
}
