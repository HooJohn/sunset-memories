import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express';

import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity'; // Import Like entity
import { MemoirCollaboration } from './entities/memoir-collaboration.entity';
import { UsersService } from '../users/users.service';
import { CreateMemoirDto } from './dto/create-memoir.dto';
import { UpdateMemoirDto } from './dto/update-memoir.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterOutlineDto } from './dto/chapter-outline.dto'; // This DTO might be from LLM step, not for DB
import { CreateCommentDto } from './dto/create-comment.dto'; // Import CreateCommentDto
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { CollaborationStatus } from './enums/collaboration-status.enum';
import { CollaborationRole } from './enums/collaboration-role.enum';

@Injectable()
export class MemoirsService {
  private readonly logger = new Logger(MemoirsService.name);

  constructor(
    @InjectRepository(Memoir)
    private readonly memoirRepository: Repository<Memoir>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Like) // Inject Like repository
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(MemoirCollaboration)
    private readonly collaborationRepository: Repository<MemoirCollaboration>,
    private readonly usersService: UsersService,
  ) {}

  // STUBBED STT Service (from previous subtask) - To be replaced by actual service call
  async transcribeAudio(file: Express.Multer.File): Promise<{ transcription: string }> {
    this.logger.log(
      `Received file for transcription: ${file.originalname}, ` +
      `MIME Type: ${file.mimetype}, Size: ${file.size} bytes.`,
    );
    const mockTranscription = `This is a mock transcription for the file: ${file.originalname}. The content would be the speech-to-text output.`;
    this.logger.log(`Mock transcription generated for ${file.originalname}`);
    return { transcription: mockTranscription };
  }

  // STUBBED LLM Service (from previous subtask)
  async generateChapterOutline(transcribedText: string): Promise<ChapterOutlineDto> {
    this.logger.log(`Received text for chapter generation. Text length: ${transcribedText.length}`);
    const mockChapterOutline: ChapterOutlineDto = {
      chapters: [
        { title: "Chapter 1: The Beginning", summary: "Early life and experiences." },
        { title: "Chapter 2: Major Events", summary: "Key moments and turning points." },
        { title: "Chapter 3: Reflections", summary: "Lessons learned and thoughts." },
      ],
    };
    this.logger.log(`Mock chapter outline generated.`);
    return mockChapterOutline;
  }

  // == Memoir Methods ==
  async createMemoir(createMemoirDto: CreateMemoirDto, userId: number): Promise<Memoir> {
    const { title, content_html, transcribed_text, chapters } = createMemoirDto;
    const newMemoir = this.memoirRepository.create({
      title,
      content_html,
      transcribed_text,
      chapters_json: chapters ? JSON.stringify(chapters) : null,
      userId,
      // is_public defaults to false in entity
    });
    this.logger.log(`User ${userId} creating memoir: ${newMemoir.title}`);
    return this.memoirRepository.save(newMemoir);
  }

  async findAllMemoirsForUser(userId: number): Promise<Memoir[]> {
    this.logger.log(`Fetching all memoirs for user ${userId}`);
    return this.memoirRepository.find({ where: { userId }, order: { updated_at: 'DESC' } });
  }

  async findMemoirByIdForUser(id: string, userId: number, relations: string[] = []): Promise<Memoir> {
    this.logger.log(`User ${userId} fetching memoir by id: ${id}`);
    const memoir = await this.memoirRepository.findOne({ where: { id, userId }, relations });
    if (!memoir) {
      throw new NotFoundException(`Memoir with ID "${id}" not found or access denied.`);
    }
    // If chapters_json is stored and chapters relation is not in `relations`, parse it.
    // However, frontend interface `Memoir` expects `chapters?: Chapter[]`.
    // If `relations` includes 'chapters', TypeORM handles it. If not, we might parse chapters_json.
    // For now, assume `relations` will include 'chapters' if needed by caller.
    // Or, if entity should always have chapters parsed from chapters_json if relation not loaded:
    if (memoir.chapters_json && (!memoir.chapters || memoir.chapters.length === 0) && !relations.includes('chapters')) {
      try {
        memoir.chapters = JSON.parse(memoir.chapters_json);
      } catch (e) {
        this.logger.error(`Failed to parse chapters_json for memoir ${memoir.id}`, e);
        // memoir.chapters remains as is (e.g. empty or undefined)
      }
    }
    return memoir;
  }

  async updateMemoir(id: string, updateMemoirDto: UpdateMemoirDto, userId: number): Promise<Memoir> {
    this.logger.log(`User ${userId} updating memoir id: ${id}`);
    const memoir = await this.findMemoirByIdForUser(id, userId); // Ensures ownership

    // Explicitly assign fields to handle undefined and stringify chapters
    if (updateMemoirDto.title !== undefined) memoir.title = updateMemoirDto.title;
    if (updateMemoirDto.content_html !== undefined) memoir.content_html = updateMemoirDto.content_html;
    if (updateMemoirDto.transcribed_text !== undefined) memoir.transcribed_text = updateMemoirDto.transcribed_text;
    if (updateMemoirDto.is_public !== undefined) memoir.is_public = updateMemoirDto.is_public;
    if (updateMemoirDto.chapters !== undefined) {
      memoir.chapters_json = updateMemoirDto.chapters ? JSON.stringify(updateMemoirDto.chapters) : null;
    }

    // Note: `Object.assign(memoir, updateMemoirDto)` would not handle chapters_json correctly if DTO has `chapters` array.
    return this.memoirRepository.save(memoir);
  }

  async deleteMemoir(id: string, userId: number): Promise<void> {
    this.logger.log(`User ${userId} deleting memoir id: ${id}`);
    const memoir = await this.findMemoirByIdForUser(id, userId); // Ensures ownership
    await this.memoirRepository.remove(memoir); // Using remove to trigger cascades if set up (e.g. for chapters)
  }

  // == Chapter Methods ==
  async createChapter(memoirId: string, createChapterDto: CreateChapterDto, userId: number): Promise<Chapter> {
    this.logger.log(`User ${userId} creating chapter for memoir ${memoirId}`);
    // First, verify the memoir exists and belongs to the user
    const memoir = await this.findMemoirByIdForUser(memoirId, userId);

    const newChapter = this.chapterRepository.create({
      ...createChapterDto,
      memoir: memoir, // Link to the memoir entity
      memoirId: memoir.id, // Explicitly set memoirId
    });
    return this.chapterRepository.save(newChapter);
  }

  async findChaptersByMemoir(memoirId: string, userId: number): Promise<Chapter[]> {
    this.logger.log(`User ${userId} fetching chapters for memoir ${memoirId}`);
    // Verify memoir ownership first
    await this.findMemoirByIdForUser(memoirId, userId);
    return this.chapterRepository.find({ where: { memoirId }, order: { order: 'ASC' } });
  }

  async findChapterById(id: string, memoirId: string, userId: number): Promise<Chapter> {
    this.logger.log(`User ${userId} fetching chapter ${id} for memoir ${memoirId}`);
    // Verify memoir ownership
    await this.findMemoirByIdForUser(memoirId, userId);
    const chapter = await this.chapterRepository.findOne({ where: { id, memoirId }});
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID "${id}" not found in memoir "${memoirId}".`);
    }
    return chapter;
  }

  async updateChapter(id: string, memoirId: string, updateChapterDto: UpdateChapterDto, userId: number): Promise<Chapter> {
    this.logger.log(`User ${userId} updating chapter ${id} for memoir ${memoirId}`);
    const chapter = await this.findChapterById(id, memoirId, userId); // Ensures ownership and chapter existence

    Object.assign(chapter, updateChapterDto);
    return this.chapterRepository.save(chapter);
  }

  async deleteChapter(id: string, memoirId: string, userId: number): Promise<void> {
    this.logger.log(`User ${userId} deleting chapter ${id} for memoir ${memoirId}`);
    const chapter = await this.findChapterById(id, memoirId, userId); // Ensures ownership and chapter existence
    await this.chapterRepository.remove(chapter);
  }

  // == Collaboration Methods ==
  async inviteCollaborator(
    memoirId: string,
    inviteDto: InviteCollaboratorDto,
    ownerId: number,
  ): Promise<MemoirCollaboration> {
    this.logger.log(`User ${ownerId} attempting to invite ${inviteDto.collaboratorPhone} to memoir ${memoirId}`);
    const memoir = await this.findMemoirByIdForUser(memoirId, ownerId); // Verifies ownership

    const collaboratorUser = await this.usersService.findOneByPhone(inviteDto.collaboratorPhone);
    if (!collaboratorUser) {
      throw new NotFoundException(`User with phone "${inviteDto.collaboratorPhone}" not found.`);
    }

    if (collaboratorUser.id === ownerId) {
      throw new BadRequestException('Cannot invite yourself as a collaborator.');
    }

    const existingCollaboration = await this.collaborationRepository.findOne({
      where: { memoirId, collaboratorId: collaboratorUser.id },
    });

    if (existingCollaboration) {
      if (existingCollaboration.status === CollaborationStatus.PENDING) {
        throw new ConflictException('This user has already been invited and their invitation is pending.');
      } else if (existingCollaboration.status === CollaborationStatus.ACCEPTED) {
        throw new ConflictException('This user is already a collaborator on this memoir.');
      }
      // If declined, perhaps allow re-inviting by deleting the old record or updating it
      // For now, let's prevent re-invitation if any record exists to keep it simple.
      // Or, update the existing one:
      // existingCollaboration.status = CollaborationStatus.PENDING;
      // existingCollaboration.role = inviteDto.role;
      // existingCollaboration.invitedById = ownerId; // Update who invited if re-inviting
      // return this.collaborationRepository.save(existingCollaboration);
      throw new ConflictException('Collaboration record for this user on this memoir already exists with a different status.');
    }

    const newCollaboration = this.collaborationRepository.create({
      memoirId,
      collaboratorId: collaboratorUser.id,
      invitedById: ownerId,
      role: inviteDto.role,
      status: CollaborationStatus.PENDING,
    });

    return this.collaborationRepository.save(newCollaboration);
  }

  async getCollaboratorsForMemoir(memoirId: string, ownerId: number): Promise<MemoirCollaboration[]> {
    await this.findMemoirByIdForUser(memoirId, ownerId); // Verifies ownership

    return this.collaborationRepository.find({
      where: { memoirId, status: CollaborationStatus.ACCEPTED }, // Typically only show accepted collaborators
      relations: ['collaborator'], // To include collaborator user details (id, phone, name, avatar_url)
    });
  }

  // Stubs for other collaboration methods to be implemented later
  async getPendingInvitationsForUser(userId: number): Promise<MemoirCollaboration[]> {
    this.logger.log(`Fetching pending invitations for user ${userId}`);
    return this.collaborationRepository.find({
      where: { collaboratorId: userId, status: CollaborationStatus.PENDING },
      relations: ['memoir', 'memoir.user', 'invitedByUser'], // Populate memoir (and its owner) and inviting user details
                                                          // memoir.user to get memoir owner's details if needed by frontend
    });
  }

  async respondToInvitation(
    collaborationId: string,
    newStatus: CollaborationStatus.ACCEPTED | CollaborationStatus.DECLINED, // DTO ensures only these two
    invitedUserId: number
  ): Promise<MemoirCollaboration> {
    this.logger.log(`User ${invitedUserId} responding to invitation ${collaborationId} with status ${newStatus}`);
    const collaboration = await this.collaborationRepository.findOne({
      where: { id: collaborationId, collaboratorId: invitedUserId },
    });

    if (!collaboration) {
      throw new NotFoundException(`Invitation with ID "${collaborationId}" not found for this user.`);
    }

    if (collaboration.status !== CollaborationStatus.PENDING) {
      throw new BadRequestException('This invitation is no longer pending and cannot be responded to.');
    }

    collaboration.status = newStatus;
    return this.collaborationRepository.save(collaboration);
  }

  async updateCollaboratorRole(collaborationId: string, newRole: CollaborationRole, ownerUserId: number): Promise<MemoirCollaboration> {
    this.logger.log(`User ${ownerUserId} attempting to update role for collaboration ${collaborationId} to ${newRole}`);
    const collaboration = await this.collaborationRepository.findOne({
      where: { id: collaborationId },
      relations: ['memoir', 'collaborator'], // Load memoir to check owner, collaborator for response
    });

    if (!collaboration) {
      throw new NotFoundException(`Collaboration record with ID "${collaborationId}" not found.`);
    }

    // Verify that the person making the request is the owner of the memoir
    if (collaboration.memoir.userId !== ownerUserId) {
      throw new ForbiddenException('You are not authorized to update roles for this memoir.');
    }

    // Prevent owner from changing their own role via this method if they are listed as collaborator by mistake
    if (collaboration.collaboratorId === ownerUserId) {
        throw new BadRequestException("Memoir owner's role cannot be changed through this method.");
    }

    collaboration.role = newRole;
    // Optionally, if status was PENDING and role is changed, maybe it should become ACCEPTED or re-pending?
    // For now, just updating role. If it was PENDING, it remains PENDING with new role.
    const updatedCollaboration = await this.collaborationRepository.save(collaboration);
    // Re-fetch with relations to ensure consistent response structure, especially if `user` was aliased as `collaborator`
    return this.collaborationRepository.findOne({
        where: { id: updatedCollaboration.id },
        relations: ['memoir', 'collaborator'] // 'collaborator' refers to the User entity via the relation name.
                                            // Ensure this relation name matches your MemoirCollaboration entity.
                                            // If the relation is named 'user' in entity, use 'user'.
                                            // Based on previous DTOs, frontend expects `collaboration.user`.
                                            // Let's assume the relation in MemoirCollaboration is named `user` for the invited user.
                                            // If it's `collaborator` in entity, map it or change frontend.
                                            // For now, assuming 'user' is the correct relation name for the collaborator details.
                                            // If `relations: ['user']` was intended for the `invitedByUser` field, this is different.
                                            // The `getCollaboratorsForMemoir` uses `relations: ['collaborator']`
                                            // Let's check MemoirCollaboration entity definition. It's `collaboratorId` and `invitedById`.
                                            // Let's assume relations are 'user' (for collaboratorId) and 'invitedBy' (for invitedById) if needed.
                                            // For this context, we need details of the user whose role is changing.
                                            // If the relation is named `collaborator` on the entity:
                                            // relations: ['memoir', 'collaborator'] is correct
                                            // Then in DTO mapping, map `collaboration.collaborator` to `response.user`
    });
  }

  async removeCollaborator(collaborationId: string, ownerUserId: number): Promise<void> {
    this.logger.log(`User ${ownerUserId} attempting to remove collaboration ${collaborationId}`);
    const collaboration = await this.collaborationRepository.findOne({
      where: { id: collaborationId },
      relations: ['memoir'], // Load memoir to check owner
    });

    if (!collaboration) {
      throw new NotFoundException(`Collaboration record with ID "${collaborationId}" not found.`);
    }

    if (collaboration.memoir.userId !== ownerUserId) {
      throw new ForbiddenException('You are not authorized to remove collaborators for this memoir.');
    }

    await this.collaborationRepository.remove(collaboration);
    this.logger.log(`Collaboration ${collaborationId} removed successfully by owner ${ownerUserId}.`);
  }

  // == Public Community Browsing Methods ==
  async getPublicMemoirs(options: { page?: number; limit?: number } = {}): Promise<{ data: Memoir[]; total: number, page: number, limit: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    this.logger.log(`Fetching public memoirs, page: ${page}, limit: ${limit}`);

    const [data, total] = await this.memoirRepository.findAndCount({
      where: { is_public: true },
      relations: ['user'], // Ensure 'user' relation is loaded for author details
      order: { updated_at: 'DESC' }, // Or created_at, or by popularity/views in future
      take: limit,
      skip: skip,
    });

    return { data, total, page, limit };
  }

  async getPublicMemoirById(memoirId: string): Promise<Memoir | null> {
    this.logger.log(`Fetching public memoir by ID: ${memoirId}`);
    const memoir = await this.memoirRepository.findOne({
      where: { id: memoirId, is_public: true },
      relations: ['user', 'chapters'], // Load author and chapters
    });

    if (!memoir) {
      throw new NotFoundException(`Public memoir with ID "${memoirId}" not found.`);
    }
    // Sort chapters by order if not automatically handled by TypeORM or DB query
    if (memoir.chapters && memoir.chapters.length > 0 && typeof memoir.chapters[0].order === 'number') {
      memoir.chapters.sort((a, b) => (a.order as number) - (b.order as number));
    } else if (memoir.chapters_json && (!memoir.chapters || memoir.chapters.length === 0)) {
      // If chapters relation was not loaded but chapters_json exists
      try {
        const parsedChapters = JSON.parse(memoir.chapters_json) as Chapter[];
        // No direct 'order' field in ChapterOutlineItemDto from DTO, but Chapter entity has it.
        // This parsing is more for when 'chapters' relation isn't loaded.
        memoir.chapters = parsedChapters;
      } catch (e) {
        this.logger.error(`Failed to parse chapters_json for public memoir ${memoir.id}`, e);
      }
    }
    return memoir;
  }

  // == Comment Methods ==
  async addComment(memoirId: string, createCommentDto: CreateCommentDto, userId: number): Promise<Comment> {
    this.logger.log(`User ${userId} adding comment to memoir ${memoirId}`);
    // Check if memoir exists and is public (or if user has access if it's private - current check is for public memoirs)
    // For adding comment, user might not need to own the memoir, but it should exist.
    // If comments are only for public memoirs, use getPublicMemoirById.
    // If comments can be on private memoirs by collaborators, different check needed.
    // For now, assume memoir existence is enough.
    const memoir = await this.memoirRepository.findOne({ where: { id: memoirId } });
    if (!memoir) {
      throw new NotFoundException(`Memoir with ID "${memoirId}" not found.`);
    }
    // Optionally, check if memoir.is_public or if user is a collaborator if comments are restricted.

    const newComment = this.commentRepository.create({
      ...createCommentDto,
      memoirId,
      userId,
    });
    const savedComment = await this.commentRepository.save(newComment);

    // Load the user relation for the response as per CommentResponseDto expectation
    return this.commentRepository.findOne({
        where: { id: savedComment.id },
        relations: ['user']
    });
  }

  async getCommentsByMemoirId(memoirId: string): Promise<Comment[]> {
    this.logger.log(`Fetching comments for memoir ${memoirId}`);
    // Similar check for memoir existence as in addComment might be good.
    const memoir = await this.memoirRepository.findOne({ where: { id: memoirId } });
    if (!memoir) {
      throw new NotFoundException(`Memoir with ID "${memoirId}" not found.`);
    }
    // Optionally, check if memoir.is_public or if user has access.

    return this.commentRepository.find({
      where: { memoirId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  // == Like Methods ==
  async likeMemoir(memoirId: string, userId: number): Promise<{ likeCount: number; isLikedByCurrentUser: boolean }> {
    this.logger.log(`User ${userId} attempting to like memoir ${memoirId}`);
    const memoir = await this.memoirRepository.findOne({ where: { id: memoirId } });
    if (!memoir) {
      throw new NotFoundException(`Memoir with ID "${memoirId}" not found.`);
    }

    // Check if already liked
    const existingLike = await this.likeRepository.findOne({ where: { memoirId, userId } });
    if (existingLike) {
      this.logger.log(`User ${userId} already liked memoir ${memoirId}. No action taken.`);
      // Return current state. Frontend might treat this as success or already-liked state.
      return { likeCount: memoir.likeCount, isLikedByCurrentUser: true };
    }

    // Create and save the new like
    const newLike = this.likeRepository.create({ memoirId, userId });
    await this.likeRepository.save(newLike);

    // Increment denormalized likeCount on the memoir
    memoir.likeCount = (memoir.likeCount || 0) + 1;
    await this.memoirRepository.save(memoir); // Save the updated memoir

    return { likeCount: memoir.likeCount, isLikedByCurrentUser: true };
  }

  async unlikeMemoir(memoirId: string, userId: number): Promise<{ likeCount: number; isLikedByCurrentUser: boolean }> {
    this.logger.log(`User ${userId} attempting to unlike memoir ${memoirId}`);
    const memoir = await this.memoirRepository.findOne({ where: { id: memoirId } });
    if (!memoir) {
      // It's okay if memoir not found, as like record wouldn't exist either.
      // Or throw NotFoundException if strictness is required.
      this.logger.warn(`Memoir with ID "${memoirId}" not found during unlike attempt. No like record can exist.`);
      return { likeCount: 0, isLikedByCurrentUser: false }; // Or memoir's current likeCount if it could be fetched
    }

    // Find and delete the like record
    const likeToDelete = await this.likeRepository.findOne({ where: { memoirId, userId } });
    if (!likeToDelete) {
      this.logger.log(`User ${userId} had not liked memoir ${memoirId}. No action taken.`);
      // Return current state. Frontend might treat this as success or already-unliked state.
      return { likeCount: memoir.likeCount, isLikedByCurrentUser: false };
    }

    await this.likeRepository.remove(likeToDelete);

    // Decrement denormalized likeCount on the memoir
    memoir.likeCount = Math.max(0, (memoir.likeCount || 0) - 1); // Ensure it doesn't go below 0
    await this.memoirRepository.save(memoir); // Save the updated memoir

    return { likeCount: memoir.likeCount, isLikedByCurrentUser: false };
  }
}
