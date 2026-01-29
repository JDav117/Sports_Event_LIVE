import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import '../types/express';

interface AuditLog {
  timestamp: Date;
  method: string;
  url: string;
  playerId?: string;
  teamId?: string;
  eventId?: string;
  action: string;
  reason: string;
  ip: string;
}

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private auditLogs: AuditLog[] = [];

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    // Capturar la respuesta original
    const originalJson = res.json.bind(res);

    res.json = (body: any) => {
      Date.now() - startTime;

      // Auditar acciones específicas
      this.auditRequest(req, res, body);

      return originalJson(body);
    };

    next();
  }

  private auditRequest(req: Request, res: Response, body: any) {
    const playerId = req.body?.playerId || (req.query?.playerId as string);
    const teamId = req.currentTeamId || req.body?.teamId;
    const eventId = req.currentEventId || req.body?.eventId;

    // Auditar intentos de inscripción no autorizados
    if (req.url.includes('/enrollment') && res.statusCode >= 400) {
      this.logAudit({
        timestamp: new Date(),
        method: req.method,
        url: req.url,
        playerId,
        teamId,
        eventId,
        action: 'UNAUTHORIZED_ENROLLMENT_ATTEMPT',
        reason: body?.message || 'Unknown error',
        ip: req.ip,
      });
    }

    // Auditar intentos de acceso a eventos no inscritos
    if (req.url.includes('/events') && res.statusCode === 403) {
      this.logAudit({
        timestamp: new Date(),
        method: req.method,
        url: req.url,
        playerId,
        teamId,
        eventId,
        action: 'UNAUTHORIZED_EVENT_ACCESS',
        reason: body?.message || 'Player not enrolled in event',
        ip: req.ip,
      });
    }

    // Auditar exceso de inscripciones
    if (
      body?.message?.includes('maximum') ||
      body?.message?.includes('excede')
    ) {
      this.logAudit({
        timestamp: new Date(),
        method: req.method,
        url: req.url,
        playerId,
        teamId,
        eventId,
        action: 'MAX_ENROLLMENT_EXCEEDED',
        reason: body?.message,
        ip: req.ip,
      });
    }
  }

  private logAudit(log: AuditLog) {
    this.auditLogs.push(log);
    console.log(`[AUDIT] ${log.action}:`, {
      timestamp: log.timestamp.toISOString(),
      playerId: log.playerId,
      teamId: log.teamId,
      eventId: log.eventId,
      reason: log.reason,
      ip: log.ip,
    });

    // Mantener solo los últimos 1000 logs en memoria
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift();
    }
  }

  // Método para obtener logs (útil para debugging)
  getAuditLogs(filters?: {
    playerId?: string;
    action?: string;
    limit?: number;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters?.playerId) {
      logs = logs.filter((log) => log.playerId === filters.playerId);
    }

    if (filters?.action) {
      logs = logs.filter((log) => log.action === filters.action);
    }

    const limit = filters?.limit || 100;
    return logs.slice(-limit).reverse();
  }
}
