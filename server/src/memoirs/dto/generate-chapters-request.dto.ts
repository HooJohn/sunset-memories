import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class GenerateChaptersRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Transcribed text cannot be empty.' })
  @MinLength(50, { message: 'Transcribed text must be at least 50 characters long to generate chapters.' }) // Example minimum length
  transcribedText: string;
}
