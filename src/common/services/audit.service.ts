import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logWs(action: string, context: Record<string, any>) {
    const entry = this.auditRepository.create({
      action,
      channel: 'ws',
      playerId: context.playerId,
      teamId: context.teamId,
      eventId: context.eventId,
      ip: context.ip,
      context,
    });

    const saved = await this.auditRepository.save(entry);

    console.info(`[AUDIT][WS] ${action}`, {
      ...context,
      createdAt: saved.createdAt.toISOString(),
    });

    return saved;
  }

  async getLogs(limit = 100): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { channel: 'ws' },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
