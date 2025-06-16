import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  @MinLength(11)
  @MaxLength(11)
  @Matches(/^1[3-9]\d{9}$/, { message: 'Phone number must be a valid Chinese mobile number' })
  phone: string;

  @IsString()
  @MinLength(4, { message: 'Verification code must be at least 4 characters long' }) // Assuming a code of at least 4 digits
  @MaxLength(6, { message: 'Verification code must be at most 6 characters long' }) // Assuming a code of at most 6 digits
  code: string;
}
