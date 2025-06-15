import { Injectable, Logger, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express'; // For Express.Multer.File type

import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { MemoirCollaboration } from './entities/memoir-collaboration.entity'; // Added
import { UsersService } from '../users/users.service'; // Added
import { CreateMemoirDto } from './dto/create-memoir.dto';
import { UpdateMemoirDto } from './dto/update-memoir.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterOutlineDto } from './dto/chapter-outline.dto';
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto'; // Added
import { CollaborationStatus, CollaborationRole } from './enums'; // Added

@Injectable()
export class MemoirsService {
  private readonly logger = new Logger(MemoirsService.name);

  constructor(
    @InjectRepository(Memoir)
    private readonly memoirRepository: Repository<Memoir>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(MemoirCollaboration) // Added
    private readonly collaborationRepository: Repository<MemoirCollaboration>,
    private readonly usersService: UsersService, // Added
  ) {}

  // STUBBED STT Service (from previous subtask)
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
    const newMemoir = this.memoirRepository.create({
      ...createMemoirDto,
      userId,
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
    return memoir;
  }

  async updateMemoir(id: string, updateMemoirDto: UpdateMemoirDto, userId: number): Promise<Memoir> {
    this.logger.log(`User ${userId} updating memoir id: ${id}`);
    const memoir = await this.findMemoirByIdForUser(id, userId); // Ensures ownership

    // TypeORM's update method doesn't run subscribers or cascades, so using save is often preferred for entities.
    // However, for partial updates, first loading then merging is common.
    Object.assign(memoir, updateMemoirDto);
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

  async updateCollaboratorRole(collaborationId: string, newRole: CollaborationRole, ownerId: number): Promise<MemoirCollaboration> {
     this.logger.warn(`updateCollaboratorRole for collab ${collaborationId} to role ${newRole} by owner ${ownerId} - Not yet fully implemented beyond this log.`);
    const collaboration = await this.collaborationRepository.findOne({where: {id: collaborationId}, relations: ['memoir']});
    if(!collaboration) throw new NotFoundException('Collaboration record not found.');
    if(collaboration.memoir.userId !== ownerId) throw new ForbiddenException('Only the memoir owner can change roles.');

    collaboration.role = newRole;
    return this.collaborationRepository.save(collaboration);
  }

  async removeCollaborator(collaborationId: string, ownerId: number): Promise<void> {
     this.logger.warn(`removeCollaborator for collab ${collaborationId} by owner ${ownerId} - Not yet fully implemented beyond this log.`);
    const collaboration = await this.collaborationRepository.findOne({where: {id: collaborationId}, relations: ['memoir']});
    if(!collaboration) throw new NotFoundException('Collaboration record not found.');
    if(collaboration.memoir.userId !== ownerId) throw new ForbiddenException('Only the memoir owner can remove collaborators.');

    await this.collaborationRepository.remove(collaboration);
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
    if (memoir.chapters) {
      memoir.chapters.sort((a, b) => a.order - b.order);
    }
    return memoir;
  }
}
