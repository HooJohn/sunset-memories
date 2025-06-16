import { IsString, IsOptional, MaxLength, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChapterOutlineItemDto } from './create-memoir.dto'; // Import from create-memoir.dto

export class UpdateMemoirDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters.' })
  title?: string;

  @IsBoolean()
  @IsOptional()
  is_public?: boolean;

  @IsString()
  @IsOptional()
  content_html?: string;

  @IsString()
  @IsOptional()
  transcribed_text?: string;

  // To validate an array of chapter objects
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChapterOutlineItemDto)
  @IsOptional()
  chapters?: ChapterOutlineItemDto[];
}
