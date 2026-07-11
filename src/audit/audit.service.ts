import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditTrail } from './entities/audit.entity';
import { Repository } from 'typeorm';
import { CreateAuditTrailDto } from './dto/create-auditTrail.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditTrail)
    private readonly auditRepository: Repository<AuditTrail>,
  ) {}

  async create(dto: CreateAuditTrailDto) {
    return await this.auditRepository.save(this.auditRepository.create(dto));
  }

  async findAll() {
    return await this.auditRepository.find({});
  }
}
