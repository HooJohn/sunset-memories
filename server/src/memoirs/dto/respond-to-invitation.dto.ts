import { IsEnum, IsNotEmpty } from 'class-validator';
import { CollaborationStatus } from '../enums/collaboration-status.enum';

export class RespondToInvitationDto {
  @IsEnum(CollaborationStatus, {
    message: 'Invalid status. Must be "accepted" or "declined".'
  })
  @IsNotEmpty({ message: 'Status cannot be empty.' })
  status: CollaborationStatus.ACCEPTED | CollaborationStatus.DECLINED; // Only allow these two for response
}
