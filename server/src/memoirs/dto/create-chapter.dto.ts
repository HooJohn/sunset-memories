import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty({ message: 'Chapter title cannot be empty.' })
  @MaxLength(255, { message: 'Chapter title cannot be longer than 255 characters.' })
  title: string;

  @IsString()
  @IsOptional()
  content?: string; // HTML content

  @IsInt({ message: 'Order must be an integer.' })
  @Min(0, { message: 'Order must be a non-negative integer.' })
  order: number;
}
