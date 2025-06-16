import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment text cannot be empty.' })
  @MaxLength(2000, { message: 'Comment text cannot be longer than 2000 characters.' })
  text: string;
}
