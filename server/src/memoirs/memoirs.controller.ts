import {
  Controller,
  Post,
  Get, // Added Get
  Patch, // Added Patch
  Delete, // Added Delete
  Param, // Added Param
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Req,
  Logger,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Body,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe, // For validating UUID parameters
  HttpCode, // For setting status codes like 204
  HttpStatus, // For HttpStatus enum
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MemoirsService } from './memoirs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TranscribeResponseDto } from './dto/transcribe-response.dto';
import { GenerateChaptersRequestDto } from './dto/generate-chapters-request.dto';
import { GenerateChaptersResponseDto } from './dto/generate-chapters-response.dto';
import { CreateMemoirDto } from './dto/create-memoir.dto';
import { UpdateMemoirDto } from './dto/update-memoir.dto';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { Express } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    phone: string;
  };
}

@Controller('memoirs')
@UseGuards(JwtAuthGuard) // Apply guard to all routes in this controller
export class MemoirsController {
  private readonly logger = new Logger(MemoirsController.name);

  constructor(private readonly memoirsService: MemoirsService) {}

  // == STT and LLM Endpoints (from previous subtasks) ==
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribeAudio(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /audio\/(mpeg|wav|webm|ogg|aac|mp3)/ }),
        ],
      }),
    ) file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ): Promise<TranscribeResponseDto> {
    this.logger.log(`User ${req.user.userId} uploading file for transcription: ${file.originalname}`);
    return this.memoirsService.transcribeAudio(file);
  }

  @Post('generate-chapters')
  @UsePipes(new ValidationPipe({ transform: true }))
  async generateChapters(
    @Body() generateChaptersDto: GenerateChaptersRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<GenerateChaptersResponseDto> {
    this.logger.log(
      `User ${req.user.userId} requesting chapter generation. Text length: ${generateChaptersDto.transcribedText.length}`
    );
    return this.memoirsService.generateChapterOutline(generateChaptersDto.transcribedText);
  }

  // == Memoir CRUD Endpoints ==
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMemoir(
    @Body() createMemoirDto: CreateMemoirDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Memoir> {
    return this.memoirsService.createMemoir(createMemoirDto, req.user.userId);
  }

  @Get()
  async findAllMemoirsForUser(@Req() req: AuthenticatedRequest): Promise<Memoir[]> {
    return this.memoirsService.findAllMemoirsForUser(req.user.userId);
  }

  @Get(':memoirId')
  async findMemoirByIdForUser(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Memoir> {
    // Optionally load chapters here, or have a separate endpoint/query param
    return this.memoirsService.findMemoirByIdForUser(memoirId, req.user.userId, ['chapters']);
  }

  @Patch(':memoirId')
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Body() updateMemoirDto: UpdateMemoirDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Memoir> {
    return this.memoirsService.updateMemoir(memoirId, updateMemoirDto, req.user.userId);
  }

  @Delete(':memoirId')
  @HttpCode(HttpStatus.NO_CONTENT) // Return 204 on successful deletion
  async deleteMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.memoirsService.deleteMemoir(memoirId, req.user.userId);
  }

  // == Chapter CRUD Endpoints (nested under memoirs) ==
  @Post(':memoirId/chapters')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createChapter(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Body() createChapterDto: CreateChapterDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter> {
    return this.memoirsService.createChapter(memoirId, createChapterDto, req.user.userId);
  }

  @Get(':memoirId/chapters')
  async findChaptersByMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter[]> {
    return this.memoirsService.findChaptersByMemoir(memoirId, req.user.userId);
  }

  @Get(':memoirId/chapters/:chapterId')
  async findChapterById(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter> {
    return this.memoirsService.findChapterById(chapterId, memoirId, req.user.userId);
  }

  @Patch(':memoirId/chapters/:chapterId')
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateChapter(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter> {
    return this.memoirsService.updateChapter(chapterId, memoirId, updateChapterDto, req.user.userId);
  }

  @Delete(':memoirId/chapters/:chapterId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChapter(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.memoirsService.deleteChapter(chapterId, memoirId, req.user.userId);
  }
}
