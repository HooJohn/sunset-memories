// import { UserProfileDto } from '../../users/dto/user-profile.dto'; // Removed problematic import
import { User } from '../../users/entities/user.entity'; // Import full User entity if BasicUserInfoDto is insufficient
import { Memoir } from '../../memoirs/entities/memoir.entity'; // Or a MemoirSummaryDto
import { ServiceType } from '../enums/service-type.enum';
import { ServiceRequestStatus } from '../enums/service-request-status.enum';

// Using a more specific type for user info, could be a dedicated DTO or subset of User entity
interface BasicUserInfoDto {
    id: number; // Ensure this matches User entity ID type (number vs string)
    name?: string;
    phone: string;
    avatar_url?: string;
    nickname?: string; // Added nickname
}

interface BasicMemoirInfoDto {
    id: string;
    title: string;
}

export class ServiceRequestResponseDto {
  id: string;
  userId: number; // Ensure this matches User entity ID type
  user?: BasicUserInfoDto;
  memoirId?: string;
  memoir?: BasicMemoirInfoDto;
  serviceType: ServiceType;
  details: string;
  // contactPreference?: string; // Removed
  contactPhone?: string;      // Added
  address?: string;           // Added
  preferredDate?: Date | string; // Added (string if DTO receives string, Date if transformed)
  status: ServiceRequestStatus;
  created_at: Date;
  updated_at: Date;

  constructor(serviceRequest: any) { // 'any' allows flexibility with joined/raw entity
    this.id = serviceRequest.id;
    this.userId = serviceRequest.userId;
    this.memoirId = serviceRequest.memoirId;
    this.serviceType = serviceRequest.serviceType;
    this.details = serviceRequest.details;
    // this.contactPreference = serviceRequest.contactPreference; // Removed
    this.contactPhone = serviceRequest.contactPhone;
    this.address = serviceRequest.address;
    // If entity stores preferredDate as Date, it's fine. If it's a string, ensure consistency.
    // The DTO receives string, service transforms to Date for entity. Entity stores Date.
    // So, response DTO should ideally output string for consistency or client handles Date obj.
    // For now, assume serviceRequest.preferredDate is a Date object from entity.
    this.preferredDate = serviceRequest.preferredDate;
    this.status = serviceRequest.status;
    this.created_at = serviceRequest.created_at;
    this.updated_at = serviceRequest.updated_at;

    if (serviceRequest.user) {
      this.user = {
        id: serviceRequest.user.id, // Ensure type match (number vs string)
        name: serviceRequest.user.name,
        phone: serviceRequest.user.phone,
        avatar_url: serviceRequest.user.avatar_url,
        nickname: serviceRequest.user.nickname, // Added nickname
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
