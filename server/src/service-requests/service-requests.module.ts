import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequest } from './entities/service-request.entity';
import { ServiceRequestsService } from './service-requests.service';
import { ServiceRequestsController } from './service-requests.controller';
import { AuthModule } from '../auth/auth.module';
import { MemoirsModule } from '../memoirs/memoirs.module'; // For MemoirsService injection

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceRequest]),
    AuthModule,    // For JwtAuthGuard
    MemoirsModule, // To provide MemoirsService
  ],
  providers: [ServiceRequestsService],
  controllers: [ServiceRequestsController],
  // exports: [ServiceRequestsService] // If other modules need it
})
export class ServiceRequestsModule {}
