import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsEnum,
    MaxLength,
    IsDateString,
    Matches
} from 'class-validator';
import { ServiceType } from '../enums/service-type.enum';

export class CreateServiceRequestDto {
  @IsUUID()
  @IsOptional()
  memoirId?: string;

  @IsEnum(ServiceType, { message: 'Invalid service type provided.' })
  @IsNotEmpty({ message: 'Service type cannot be empty.' })
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty({ message: 'Details/Description cannot be empty.' }) // Frontend uses 'description', maps to 'details'
  @MaxLength(5000, { message: 'Details/Description cannot be longer than 5000 characters.'})
  details: string;

  // contactPreference field removed

  @IsString()
  @IsNotEmpty({ message: 'Contact phone cannot be empty.' })
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'Invalid phone number format. Include country code if applicable.'})
  contactPhone: string;

  @IsString()
  @IsNotEmpty({ message: 'Address cannot be empty.' })
  @MaxLength(255, { message: 'Address cannot be longer than 255 characters.'})
  address: string;

  @IsDateString({}, { message: 'Preferred date must be a valid date string (YYYY-MM-DD).' })
  @IsOptional()
  preferredDate?: string; // Received as string, will be transformed to Date in service if needed
}
