import { UserProfileDto } from '../../users/dto/user-profile.dto'; // Assuming a DTO for user details exists
import { Memoir } from '../../memoirs/entities/memoir.entity'; // Or a MemoirSummaryDto
import { ServiceType } from '../enums/service-type.enum';
import { ServiceRequestStatus } from '../enums/service-request-status.enum';

// Example of how User might be represented in response.
// Create a UserProfileDto in users/dto if it doesn't exist.
// For now, let's assume a simplified User object structure.
interface BasicUserInfoDto {
    id: number;
    name?: string;
    phone: string;
}

interface BasicMemoirInfoDto {
    id: string;
    title: string;
}


export class ServiceRequestResponseDto {
  id: string;
  userId: number;
  user?: BasicUserInfoDto; // Populated user details
  memoirId?: string;
  memoir?: BasicMemoirInfoDto; // Populated memoir details
  serviceType: ServiceType;
  details: string;
  contactPreference?: string;
  status: ServiceRequestStatus;
  created_at: Date;
  updated_at: Date;

  constructor(serviceRequest: any) { // 'any' to be flexible with entity or joined results
    this.id = serviceRequest.id;
    this.userId = serviceRequest.userId;
    this.memoirId = serviceRequest.memoirId;
    this.serviceType = serviceRequest.serviceType;
    this.details = serviceRequest.details;
    this.contactPreference = serviceRequest.contactPreference;
    this.status = serviceRequest.status;
    this.created_at = serviceRequest.created_at;
    this.updated_at = serviceRequest.updated_at;

    if (serviceRequest.user) {
      this.user = {
        id: serviceRequest.user.id,
        name: serviceRequest.user.name,
        phone: serviceRequest.user.phone,
      };
    }
    if (serviceRequest.memoir) {
        this.memoir = {
            id: serviceRequest.memoir.id,
            title: serviceRequest.memoir.title,
        };
    }
  }
}
