import { IsString, IsNotEmpty, IsEnum, Matches } from 'class-validator';
import { CollaborationRole } from '../enums/collaboration-role.enum';

export class InviteCollaboratorDto {
  @IsString()
  @IsNotEmpty({ message: 'Collaborator phone number cannot be empty.' })
  @Matches(/^1[3-9]\d{9}$/, { message: 'Phone number must be a valid Chinese mobile number.' }) // Assuming phone for user lookup
  collaboratorPhone: string; // Changed from collaboratorEmailOrPhone to be specific

  @IsEnum(CollaborationRole, { message: 'Invalid role selected.' })
  @IsNotEmpty({ message: 'Role must be specified.' })
  role: CollaborationRole;
}
