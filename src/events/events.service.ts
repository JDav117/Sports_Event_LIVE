import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event, EventStatus, EventType } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    // Validar que endTime sea después de startTime
    const startTime = new Date(createEventDto.startTime);
    const endTime = new Date(createEventDto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException(
        'La hora de fin debe ser posterior a la hora de inicio',
      );
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      startTime,
      endTime,
      status: EventStatus.SCHEDULED,
    });

    return await this.eventRepository.save(event);
  }

  async findAll(filters?: {
    teamId?: string;
    type?: EventType;
    status?: EventStatus;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Event[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.team', 'team');

    if (filters?.teamId) {
      queryBuilder.andWhere('event.teamId = :teamId', {
        teamId: filters.teamId,
      });
    }

    if (filters?.type) {
      queryBuilder.andWhere('event.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('event.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.startDate && filters?.endDate) {
      queryBuilder.andWhere('event.startTime BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    } else if (filters?.startDate) {
      queryBuilder.andWhere('event.startTime >= :startDate', {
        startDate: filters.startDate,
      });
    } else if (filters?.endDate) {
      queryBuilder.andWhere('event.startTime <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const [data, total] = await queryBuilder
      .orderBy('event.startTime', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['team', 'enrollments', 'attendances'],
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${id} no encontrado`);
    }

    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    // Validar que no se pueda editar un evento live o finished
    if (
      event.status === EventStatus.LIVE ||
      event.status === EventStatus.FINISHED
    ) {
      throw new BadRequestException(
        `No se puede editar el horario de un evento en estado ${event.status}`,
      );
    }

    // Si se actualizan las fechas, validar
    if (updateEventDto.startTime || updateEventDto.endTime) {
      const startTime = updateEventDto.startTime
        ? new Date(updateEventDto.startTime)
        : event.startTime;
      const endTime = updateEventDto.endTime
        ? new Date(updateEventDto.endTime)
        : event.endTime;

      if (endTime <= startTime) {
        throw new BadRequestException(
          'La hora de fin debe ser posterior a la hora de inicio',
        );
      }

      Object.assign(event, {
        ...updateEventDto,
        startTime,
        endTime,
      });
    } else {
      Object.assign(event, updateEventDto);
    }

    return await this.eventRepository.save(event);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateEventStatusDto,
  ): Promise<Event> {
    const event = await this.findOne(id);
    const newStatus = updateStatusDto.status;

    // Solo el coach puede cambiar a live o finished
    // NOTA IMPORTANTE: En producción, esto debería verificarse con un Guard de autenticación y JWT
    // que valide que el usuario actual es el entrenador del equipo (event.team.coach)
    //
    // Implementación recomendada:
    // 1. Crear un AuthGuard que extraiga el usuario del JWT
    // 2. Verificar que user.id === event.team.coach o user.role === 'coach'
    // 3. Aplicar el guard con @UseGuards(AuthGuard, CoachGuard) en el controlador
    //
    // Ejemplo de implementación futura:
    if (newStatus === EventStatus.LIVE || newStatus === EventStatus.FINISHED) {
      // TODO: Implementar validación real cuando se integre autenticación
      // if (!coachId || event.team.coach !== coachId) {
      //   throw new ForbiddenException('Solo el entrenador puede cambiar el evento a este estado');
      // }
      console.log(
        `[SECURITY] Estado del evento ${id} cambiado a ${newStatus}. Validar que sea el coach autorizado.`,
      );
    }

    // Validar margen de tiempo para iniciar evento
    if (newStatus === EventStatus.LIVE) {
      const now = new Date();
      const startTime = new Date(event.startTime);
      const marginMinutes =
        parseInt(process.env.EVENT_START_MARGIN_MINUTES) || 15;
      const marginMs = marginMinutes * 60 * 1000;

      if (now < new Date(startTime.getTime() - marginMs)) {
        throw new BadRequestException(
          `No se puede iniciar el evento antes de ${marginMinutes} minutos de su hora de inicio`,
        );
      }
    }

    event.status = newStatus;
    return await this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);

    if (event.status === EventStatus.LIVE) {
      throw new BadRequestException('No se puede eliminar un evento en vivo');
    }

    await this.eventRepository.remove(event);
  }

  async getEventEnrollmentCount(eventId: string): Promise<number> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['enrollments'],
    });

    if (!event) {
      throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
    }

    return (
      event.enrollments?.filter((e) => e.status === 'approved').length || 0
    );
  }
}
