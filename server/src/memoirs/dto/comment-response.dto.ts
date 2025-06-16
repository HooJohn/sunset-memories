import { User } from '../../users/entities/user.entity'; // For typing the user in constructor
import { Comment } from '../entities/comment.entity'; // For typing the comment in constructor

// DTO for user information included in a comment response
class CommentUserDto {
  id: number; // Assuming user ID is number
  name?: string;
  nickname?: string;
  avatar_url?: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.nickname = user.nickname;
    this.avatar_url = user.avatar_url;
  }
}

export class CommentResponseDto {
  id: string;
  text: string;
  userId: number; // Assuming user ID is number
  memoirId: string;
  created_at: Date;
  user?: CommentUserDto; // Nested user details

  constructor(comment: Comment) {
    this.id = comment.id;
    this.text = comment.text;
    this.userId = comment.userId;
    this.memoirId = comment.memoirId;
    this.created_at = comment.created_at;
    if (comment.user) { // Check if user relation is loaded
      this.user = new CommentUserDto(comment.user);
    }
  }
}
