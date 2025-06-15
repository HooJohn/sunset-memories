import { IsArray, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer'; // Required for @ValidateNested

class ChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class ChapterOutlineDto {
  @IsArray()
  @ValidateNested({ each: true }) // Validates each object in the array
  @Type(() => ChapterDto) // Specifies the type of the objects in the array for validation
  chapters: ChapterDto[];
}
