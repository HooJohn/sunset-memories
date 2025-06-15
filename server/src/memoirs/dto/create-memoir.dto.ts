import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateMemoirDto {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @MaxLength(255, { message: 'Title cannot be longer than 255 characters.' })
  title: string;
}
