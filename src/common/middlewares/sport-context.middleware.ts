import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      currentTeamId?: string;
      currentEventId?: string;
    }
  }
}

@Injectable()
export class SportContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extraer información de contexto deportivo de headers o params
    const teamIdFromHeader = req.headers['x-team-id'] as string;
    const eventIdFromHeader = req.headers['x-event-id'] as string;

    // También puede venir de los params de la URL
    const teamIdFromParams = req.params.teamId;
    const eventIdFromParams = req.params.eventId || req.params.id;

    // Priorizar params sobre headers
    req.currentTeamId = teamIdFromParams || teamIdFromHeader;
    req.currentEventId = eventIdFromParams || eventIdFromHeader;

    console.log(
      `[SportContext] TeamId: ${req.currentTeamId}, EventId: ${req.currentEventId}`,
    );

    next();
  }
}
