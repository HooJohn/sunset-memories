import { IsString, IsNotEmpty, MaxLength, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer'; // For ValidateNested

// Define a simple chapter DTO for validation if chapters is an array of objects
export class ChapterOutlineItemDto { // Exporting if it needs to be used elsewhere, or keep local
  @IsString()
  @IsNotEmpty({ message: 'Chapter title cannot be empty.'})
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class CreateMemoirDto {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters.' })
  title: string;

  @IsString()
  @IsOptional() // Content might be added progressively after initial creation
  content_html?: string;

  @IsString()
  @IsOptional()
  transcribed_text?: string;

  // To validate an array of chapter objects
  @IsArray()
  @ValidateNested({ each: true }) // Validates each object in the array
  @Type(() => ChapterOutlineItemDto) // Specifies the type of the objects in the array for validation
  @IsOptional()
  chapters?: ChapterOutlineItemDto[];
}
