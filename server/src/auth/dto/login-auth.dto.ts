import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  @Matches(/^1[3-9]\d{9}$/, { message: 'Phone number must be a valid Chinese mobile number' })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
