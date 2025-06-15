import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  Logger,
  ForbiddenException, // For checking user ID against collaboration record
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MemoirsService } from '../memoirs/memoirs.service'; // Assuming logic remains in MemoirsService for now
import { MemoirCollaboration } from '../memoirs/entities/memoir-collaboration.entity';
import { RespondToInvitationDto } from '../memoirs/dto/respond-to-invitation.dto';
import { CollaborationStatus } from '../memoirs/enums/collaboration-status.enum';

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    phone: string;
  };
}

@Controller('collaborations') // Base route for collaboration-specific actions
@UseGuards(JwtAuthGuard)
export class CollaborationsController {
  private readonly logger = new Logger(CollaborationsController.name);

  constructor(
    private readonly memoirsService: MemoirsService, // Injecting MemoirsService
  ) {}

  @Get('invitations/pending')
  async getPendingInvitations(
    @Req() req: AuthenticatedRequest,
  ): Promise<MemoirCollaboration[]> {
    this.logger.log(`User ${req.user.userId} fetching their pending invitations.`);
    return this.memoirsService.getPendingInvitationsForUser(req.user.userId);
  }

  @Patch('invitations/:collaborationId/respond')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async respondToInvitation(
    @Param('collaborationId', ParseUUIDPipe) collaborationId: string,
    @Body() respondDto: RespondToInvitationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<MemoirCollaboration> {
    this.logger.log(
      `User ${req.user.userId} responding to invitation ${collaborationId} with status ${respondDto.status}`
    );
    // Service method already verifies that invitedUserId matches req.user.userId
    return this.memoirsService.respondToInvitation(collaborationId, respondDto.status, req.user.userId);
  }

  // The other owner-specific actions (update role, remove collaborator)
  // could also be here or stay in MemoirsController, depending on preference.
  // For example, if an owner is managing a collaboration, it could be:
  // PATCH /collaborations/:collaborationId/role (by owner)
  // DELETE /collaborations/:collaborationId (by owner)
  // This would require fetching the collaboration, then its memoir, then checking memoir.userId against ownerId.
}
