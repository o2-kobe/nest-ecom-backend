import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditTrail } from './entities/audit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditTrail)
    private readonly auditRepository: Repository<AuditTrail>,
  ) {}
}
