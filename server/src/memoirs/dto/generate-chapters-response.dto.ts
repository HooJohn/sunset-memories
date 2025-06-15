import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ChapterOutlineDto } from './chapter-outline.dto'; // Re-using the structure

// For now, this DTO directly uses the ChapterOutlineDto structure.
// It can be expanded later if the response needs more fields.
export class GenerateChaptersResponseDto extends ChapterOutlineDto {}
