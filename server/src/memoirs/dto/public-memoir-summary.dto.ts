import { Chapter } from "../entities/chapter.entity"; // Only for type if needed, often omitted in summary

// Basic author info to include in public listings
class AuthorInfoDto {
  id: number;
  name?: string;
  avatar_url?: string;

  constructor(user: { id: number; name?: string; avatar_url?: string }) {
    this.id = user.id;
    this.name = user.name;
    this.avatar_url = user.avatar_url;
  }
}

export class PublicMemoirSummaryDto {
  id: string;
  title: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  author: AuthorInfoDto;
  // Optional: excerpt or first few lines of content, chapter count, etc.
  // For simplicity, keeping it minimal.

  constructor(memoir: any /* Memoir entity, potentially with user relation loaded */) {
    this.id = memoir.id;
    this.title = memoir.title;
    this.is_public = memoir.is_public;
    this.created_at = memoir.created_at;
    this.updated_at = memoir.updated_at;
    if (memoir.user) { // memoir.user is the loaded User entity
      this.author = new AuthorInfoDto(memoir.user);
    } else {
      // Fallback if user relation isn't loaded, though it should be for public views
      this.author = new AuthorInfoDto({ id: memoir.userId, name: 'Unknown Author' });
    }
  }
}
