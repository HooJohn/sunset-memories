import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Express } from 'express'; // For Express.Multer.File type

import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { CreateMemoirDto } from './dto/create-memoir.dto';
import { UpdateMemoirDto } from './dto/update-memoir.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ChapterOutlineDto } from './dto/chapter-outline.dto'; // For the existing method

@Injectable()
export class MemoirsService {
  private readonly logger = new Logger(MemoirsService.name);

  constructor(
    @InjectRepository(Memoir)
    private readonly memoirRepository: Repository<Memoir>,
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    // Consider injecting UsersService if more complex user checks are needed beyond userId
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
}
