import { IsEnum, IsNotEmpty } from 'class-validator';
import { CollaborationRole } from '../enums/collaboration-role.enum'; // Adjust path if enums are elsewhere

export class UpdateCollaborationRoleDto {
  @IsEnum(CollaborationRole, { message: 'Invalid collaboration role provided.' })
  @IsNotEmpty({ message: 'Collaboration role cannot be empty.' })
  role: CollaborationRole;
}
