import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Chapter title cannot be longer than 255 characters.' })
  title?: string;

  @IsString()
  @IsOptional()
  content?: string; // HTML content

  @IsInt({ message: 'Order must be an integer.' })
  @IsOptional()
  @Min(0, { message: 'Order must be a non-negative integer.' })
  order?: number;
}
