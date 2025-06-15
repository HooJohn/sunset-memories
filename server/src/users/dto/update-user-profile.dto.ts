import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name cannot be longer than 100 characters.' })
  name?: string;

  @IsUrl({}, { message: 'Avatar URL must be a valid URL.' })
  @IsOptional()
  @MaxLength(500, { message: 'Avatar URL cannot be longer than 500 characters.'})
  avatar_url?: string;
}
