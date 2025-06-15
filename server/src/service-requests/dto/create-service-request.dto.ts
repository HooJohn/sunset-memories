import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, MaxLength } from 'class-validator';
import { ServiceType } from '../enums/service-type.enum';

export class CreateServiceRequestDto {
  @IsUUID()
  @IsOptional()
  memoirId?: string;

  @IsEnum(ServiceType, { message: 'Invalid service type provided.' })
  @IsNotEmpty({ message: 'Service type cannot be empty.' })
  serviceType: ServiceType;

  @IsString()
  @IsNotEmpty({ message: 'Details cannot be empty.' })
  @MaxLength(5000, { message: 'Details cannot be longer than 5000 characters.'})
  details: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Contact preference cannot be longer than 50 characters.'})
  contactPreference?: string; // e.g., 'phone', 'email', or specific instructions
}
