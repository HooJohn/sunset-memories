import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from './entities/service-request.entity';
import { CreateServiceRequestDto } from './dto/create-service-request.dto';
import { ServiceRequestStatus } from './enums/service-request-status.enum';
import { MemoirsService } from '../memoirs/memoirs.service'; // To validate memoir ownership

@Injectable()
export class ServiceRequestsService {
  private readonly logger = new Logger(ServiceRequestsService.name);

  constructor(
    @InjectRepository(ServiceRequest)
    private readonly serviceRequestRepository: Repository<ServiceRequest>,
    private readonly memoirsService: MemoirsService, // Injected to check memoir ownership
  ) {}

  async create(createDto: CreateServiceRequestDto, userId: number): Promise<ServiceRequest> {
    this.logger.log(`User ${userId} creating service request of type ${createDto.serviceType}`);

    if (createDto.memoirId) {
      // Validate that the memoirId, if provided, belongs to the user
      // This throws NotFoundException if memoir doesn't exist or ForbiddenException if not owned by user (based on findMemoirByIdForUser logic)
      await this.memoirsService.findMemoirByIdForUser(createDto.memoirId, userId);
    }

    const newServiceRequest = this.serviceRequestRepository.create({
      ...createDto,
      userId,
      status: ServiceRequestStatus.PENDING_REVIEW, // Initial status
    });

    return this.serviceRequestRepository.save(newServiceRequest);
  }

  async findAllForUser(userId: number): Promise<ServiceRequest[]> {
    this.logger.log(`Fetching all service requests for user ${userId}`);
    return this.serviceRequestRepository.find({
      where: { userId },
      order: { created_at: 'DESC' },
      relations: ['memoir'], // Optionally load memoir title
    });
  }

  async findOneForUser(id: string, userId: number): Promise<ServiceRequest> {
    this.logger.log(`User ${userId} fetching service request by id: ${id}`);
    const serviceRequest = await this.serviceRequestRepository.findOne({
      where: { id, userId },
      relations: ['memoir', 'user'], // Optionally load related entities
    });

    if (!serviceRequest) {
      throw new NotFoundException(`Service Request with ID "${id}" not found or access denied.`);
    }
    return serviceRequest;
  }

  // Future methods:
  // async updateStatusByAdmin(id: string, status: ServiceRequestStatus, adminNotes?: string): Promise<ServiceRequest>
  // async cancelByUser(id: string, userId: number): Promise<ServiceRequest>
}
