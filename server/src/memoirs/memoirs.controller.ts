import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
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
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query, // Added Query decorator
  DefaultValuePipe, // For default pagination values
  ParseIntPipe, // For parsing pagination values
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
import { InviteCollaboratorDto } from './dto/invite-collaborator.dto';
import { MemoirCollaboration } from './entities/memoir-collaboration.entity';
import { Memoir } from './entities/memoir.entity';
import { Chapter } from './entities/chapter.entity';
import { PublicMemoirSummaryDto } from './dto/public-memoir-summary.dto';
import { PublicMemoirDetailDto } from './dto/public-memoir-detail.dto';
import { CreateCommentDto } from './dto/create-comment.dto'; // Import CreateCommentDto
import { CommentResponseDto } from './dto/comment-response.dto'; // Import CommentResponseDto
import { Comment } from './entities/comment.entity'; // Import Comment entity for type hinting
import { Express } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    phone: string;
  };
}

@Controller('memoirs')
// @UseGuards(JwtAuthGuard) // Removed class-level guard, will apply individually
export class MemoirsController {
  private readonly logger = new Logger(MemoirsController.name);

  constructor(private readonly memoirsService: MemoirsService) {}

  // == Public Community Endpoints ==
  @Get('public')
  async getPublicMemoirs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<{ data: PublicMemoirSummaryDto[]; total: number; page: number; limit: number }> {
    const result = await this.memoirsService.getPublicMemoirs({ page, limit });
    return {
      data: result.data.map(memoir => new PublicMemoirSummaryDto(memoir)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('public/:memoirId')
  async getPublicMemoirById(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
  ): Promise<PublicMemoirDetailDto> {
    const memoir = await this.memoirsService.getPublicMemoirById(memoirId);
    return new PublicMemoirDetailDto(memoir); // DTO handles NotFoundException if memoir is null
  }

  // == STT and LLM Endpoints (Authenticated) ==
  @Post('transcribe')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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

  // == Memoir CRUD Endpoints (Authenticated) ==
  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createMemoir(
    @Body() createMemoirDto: CreateMemoirDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Memoir> {
    return this.memoirsService.createMemoir(createMemoirDto, req.user.userId);
  }

  @Get() // This GET /memoirs is for the authenticated user's memoirs
  @UseGuards(JwtAuthGuard)
  async findAllMemoirsForUser(@Req() req: AuthenticatedRequest): Promise<Memoir[]> {
    return this.memoirsService.findAllMemoirsForUser(req.user.userId);
  }

  // This GET /memoirs/:memoirId is for the authenticated user's specific memoir
  @Get(':memoirId')
  @UseGuards(JwtAuthGuard)
  async findMemoirByIdForUser(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Memoir> {
    return this.memoirsService.findMemoirByIdForUser(memoirId, req.user.userId, ['chapters', 'user']); // Also load user for consistency if needed by client
  }

  @Patch(':memoirId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, skipMissingProperties: true }))
  async updateMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Body() updateMemoirDto: UpdateMemoirDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Memoir> {
    return this.memoirsService.updateMemoir(memoirId, updateMemoirDto, req.user.userId);
  }

  @Delete(':memoirId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.memoirsService.deleteMemoir(memoirId, req.user.userId);
  }

  // == Chapter CRUD Endpoints (Authenticated) ==
  @Post(':memoirId/chapters')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createChapter(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Body() createChapterDto: CreateChapterDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter> {
    return this.memoirsService.createChapter(memoirId, createChapterDto, req.user.userId);
  }

  @Get(':memoirId/chapters')
  @UseGuards(JwtAuthGuard)
  async findChaptersByMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter[]> {
    return this.memoirsService.findChaptersByMemoir(memoirId, req.user.userId);
  }

  @Get(':memoirId/chapters/:chapterId')
  @UseGuards(JwtAuthGuard)
  async findChapterById(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<Chapter> {
    return this.memoirsService.findChapterById(chapterId, memoirId, req.user.userId);
  }

  @Patch(':memoirId/chapters/:chapterId')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteChapter(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Param('chapterId', ParseUUIDPipe) chapterId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.memoirsService.deleteChapter(chapterId, memoirId, req.user.userId);
  }

  // == Collaboration Routes (Authenticated) ==
  @Post(':memoirId/collaborators')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async inviteCollaborator(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Body() inviteCollaboratorDto: InviteCollaboratorDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MemoirCollaboration> {
    return this.memoirsService.inviteCollaborator(memoirId, inviteCollaboratorDto, req.user.userId);
  }

  @Get(':memoirId/collaborators')
  @UseGuards(JwtAuthGuard)
  async getCollaboratorsForMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<MemoirCollaboration[]> {
    return this.memoirsService.getCollaboratorsForMemoir(memoirId, req.user.userId);
  }

  // == Comment Routes ==
  @Post(':memoirId/comments')
  @UseGuards(JwtAuthGuard) // User must be logged in to comment
  @UsePipes(new ValidationPipe({ transform: true }))
  async addComment(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CommentResponseDto> {
    this.logger.log(`User ${req.user.userId} adding comment to memoir ${memoirId}`);
    const comment = await this.memoirsService.addComment(memoirId, createCommentDto, req.user.userId);
    return new CommentResponseDto(comment); // Transform entity to DTO
  }

  @Get(':memoirId/comments')
  // No JwtAuthGuard here if comments on public memoirs can be viewed by anyone.
  // If only for authenticated users or collaborators, add @UseGuards(JwtAuthGuard).
  // For now, assuming public visibility of comments on (potentially public) memoirs.
  async getCommentsByMemoirId(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
  ): Promise<CommentResponseDto[]> {
    this.logger.log(`Fetching comments for memoir ${memoirId}`);
    const comments = await this.memoirsService.getCommentsByMemoirId(memoirId);
    return comments.map(comment => new CommentResponseDto(comment)); // Transform entities to DTOs
  }

  // == Like Routes ==
  @Post(':memoirId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // Or HttpStatus.CREATED if a "like" resource is made, OK for toggle
  async likeMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ likeCount: number; isLikedByCurrentUser: boolean }> {
    this.logger.log(`User ${req.user.userId} liking memoir ${memoirId}`);
    return this.memoirsService.likeMemoir(memoirId, req.user.userId);
  }

  @Delete(':memoirId/like')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK) // OK implies the action was successful (even if it meant "no change")
  async unlikeMemoir(
    @Param('memoirId', ParseUUIDPipe) memoirId: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<{ likeCount: number; isLikedByCurrentUser: boolean }> {
    this.logger.log(`User ${req.user.userId} unliking memoir ${memoirId}`);
    return this.memoirsService.unlikeMemoir(memoirId, req.user.userId);
  }
}
