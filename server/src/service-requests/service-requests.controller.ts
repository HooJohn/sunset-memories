import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  ValidationPipe,
  UsePipes,
  ParseUUIDPipe,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ServiceRequestsService } from './service-requests.service';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ServiceRequestResponseDto } from './dto/service-request-response.dto';
import { ServiceRequest as ServiceRequestEntity } from './entities/service-request.entity'; // For type hinting

interface AuthenticatedRequest extends Request {
  user: {
    userId: number;
    phone: string; // Or whatever JWT payload provides
  };
}

@Controller('service-requests')
@UseGuards(JwtAuthGuard)
export class ServiceRequestsController {
  private readonly logger = new Logger(ServiceRequestsController.name);

  constructor(private readonly serviceRequestsService: ServiceRequestsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(
    @Body() createDto: CreateServiceRequestDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`User ${req.user.userId} submitting a new service request of type ${createDto.serviceType}`);
    const serviceRequest = await this.serviceRequestsService.create(createDto, req.user.userId);
    return new ServiceRequestResponseDto(serviceRequest); // Map to response DTO
  }

  @Get()
  async findAllForUser(@Req() req: AuthenticatedRequest): Promise<ServiceRequestResponseDto[]> {
    this.logger.log(`User ${req.user.userId} fetching their service requests.`);
    const serviceRequests = await this.serviceRequestsService.findAllForUser(req.user.userId);
    return serviceRequests.map(sr => new ServiceRequestResponseDto(sr)); // Map to response DTO
  }

  @Get(':id')
  async findOneForUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<ServiceRequestResponseDto> {
    this.logger.log(`User ${req.user.userId} fetching service request with id ${id}.`);
    const serviceRequest = await this.serviceRequestsService.findOneForUser(id, req.user.userId);
    return new ServiceRequestResponseDto(serviceRequest); // Map to response DTO
  }
}
