import { IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class UpdateMemoirDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters.' })
  title?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;
}
