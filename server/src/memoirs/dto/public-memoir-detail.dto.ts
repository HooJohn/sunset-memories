import { Chapter } from '../entities/chapter.entity'; // Chapter entity for structure

// Basic author info to include
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

// Simplified Chapter DTO for public view (e.g., omitting sensitive fields if any)
class PublicChapterDto {
  id: string;
  title: string;
  content: string;
  order: number;
  created_at: Date;
  updated_at: Date;

  constructor(chapter: Chapter) {
    this.id = chapter.id;
    this.title = chapter.title;
    this.content = chapter.content; // Assuming full content is public for public memoirs
    this.order = chapter.order;
    this.created_at = chapter.created_at;
    this.updated_at = chapter.updated_at;
  }
}

export class PublicMemoirDetailDto {
  id: string;
  title: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
  author: AuthorInfoDto;
  chapters: PublicChapterDto[];

  constructor(memoir: any /* Memoir entity with user and chapters relations loaded */) {
    this.id = memoir.id;
    this.title = memoir.title;
    this.is_public = memoir.is_public;
    this.created_at = memoir.created_at;
    this.updated_at = memoir.updated_at;

    if (memoir.user) {
      this.author = new AuthorInfoDto(memoir.user);
    } else {
      this.author = new AuthorInfoDto({ id: memoir.userId, name: 'Unknown Author' });
    }

    if (memoir.chapters && Array.isArray(memoir.chapters)) {
      this.chapters = memoir.chapters
        .map(chapter => new PublicChapterDto(chapter))
        .sort((a, b) => a.order - b.order); // Ensure chapters are sorted
    } else {
      this.chapters = [];
    }
  }
}
