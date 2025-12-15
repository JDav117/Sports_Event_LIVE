import { CanActivate, ExecutionContext, ForbiddenException, Injectable, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { EventsService } from '../../events/events.service';

/**
 * Guard simple que valida que el coach del evento (event.team.coach)
 * coincida con el valor enviado en el header `X-Coach-Id`.
 */
@Injectable()
export class CoachGuard implements CanActivate {
  constructor(private readonly eventsService: EventsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const coachId = (request.headers['x-coach-id'] as string) || '';
    const eventId = request.params?.id;

    if (!eventId) {
      throw new BadRequestException('Falta el ID del evento en la ruta');
    }

    if (!coachId) {
      throw new ForbiddenException('Se requiere el header X-Coach-Id para esta operación');
    }

    const event = await this.eventsService.findOne(eventId);

    if (!event.team?.coach) {
      throw new ForbiddenException('El evento no tiene entrenador asignado');
    }

    if (event.team.coach !== coachId) {
      throw new ForbiddenException('Solo el coach del equipo puede cambiar el estado del evento');
    }

    // Dejar disponible el coachId para handlers posteriores si se necesita
    (request as any).coachId = coachId;
    return true;
  }
}
