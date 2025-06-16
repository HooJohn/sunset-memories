import { IsString, MinLength, MaxLength, Matches, IsOptional, IsUrl } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  @Matches(/^1[3-9]\d{9}$/, { message: 'Phone number must be a valid Chinese mobile number' })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Nickname cannot be empty' })
  @MaxLength(50, { message: 'Nickname must be 50 characters or less' })
  nickname: string; // Assuming nickname is mandatory from frontend during registration

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name must be 100 characters or less' })
  name?: string;

  @IsString() // Using IsString for flexibility, could use IsUrl for stricter validation
  @IsOptional()
  @MaxLength(255, { message: 'Avatar URL must be 255 characters or less' })
  // @IsUrl({}, { message: 'Avatar URL must be a valid URL' }) // Uncomment for stricter URL validation
  avatar_url?: string;
}
