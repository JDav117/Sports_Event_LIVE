import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEnrollment, EnrollmentStatus, EnrollmentType } from './player-enrollment.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { TeamsService } from '../teams/teams.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class PlayerEnrollmentService {
  constructor(
    @InjectRepository(PlayerEnrollment)
    private readonly enrollmentRepository: Repository<PlayerEnrollment>,
    private readonly teamsService: TeamsService,
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {}

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<PlayerEnrollment> {
    const { enrollmentType, teamId, eventId, playerId } = createEnrollmentDto;

    // Validar que se proporcionen los IDs necesarios según el tipo
    if ((enrollmentType === EnrollmentType.TEAM || enrollmentType === EnrollmentType.BOTH) && !teamId) {
      throw new BadRequestException('teamId es requerido para inscripciones de tipo team o both');
    }

    if ((enrollmentType === EnrollmentType.EVENT || enrollmentType === EnrollmentType.BOTH) && !eventId) {
      throw new BadRequestException('eventId es requerido para inscripciones de tipo event o both');
    }

    // Verificar que el equipo existe y validar maxPlayers
    if (teamId) {
      const team = await this.teamsService.findOne(teamId);
      const currentEnrollments = await this.teamsService.getTeamEnrollmentCount(teamId);

      if (currentEnrollments >= team.maxPlayers) {
        throw new BadRequestException(
          `El equipo ha alcanzado el número máximo de jugadores (${team.maxPlayers})`
        );
      }

      // Verificar inscripción duplicada
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: {
          playerId,
          teamId,
          status: EnrollmentStatus.APPROVED,
        },
      });

      if (existingEnrollment) {
        throw new BadRequestException('El jugador ya está inscrito en este equipo');
      }
    }

    // Verificar que el evento existe y validar maxAttendees
    if (eventId) {
      const event = await this.eventsService.findOne(eventId);
      
      if (event.maxAttendees) {
        const currentEnrollments = await this.eventsService.getEventEnrollmentCount(eventId);

        if (currentEnrollments >= event.maxAttendees) {
          throw new BadRequestException(
            `El evento ha alcanzado el número máximo de asistentes (${event.maxAttendees})`
          );
        }
      }

      // Verificar inscripción duplicada
      const existingEnrollment = await this.enrollmentRepository.findOne({
        where: {
          playerId,
          eventId,
          status: EnrollmentStatus.APPROVED,
        },
      });

      if (existingEnrollment) {
        throw new BadRequestException('El jugador ya está inscrito en este evento');
      }
    }

    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async findAll(filters?: {
    playerId?: string;
    teamId?: string;
    eventId?: string;
    status?: EnrollmentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ data: PlayerEnrollment[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.enrollmentRepository.createQueryBuilder('enrollment')
      .leftJoinAndSelect('enrollment.team', 'team')
      .leftJoinAndSelect('enrollment.event', 'event');

    if (filters?.playerId) {
      queryBuilder.andWhere('enrollment.playerId = :playerId', { playerId: filters.playerId });
    }

    if (filters?.teamId) {
      queryBuilder.andWhere('enrollment.teamId = :teamId', { teamId: filters.teamId });
    }

    if (filters?.eventId) {
      queryBuilder.andWhere('enrollment.eventId = :eventId', { eventId: filters.eventId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('enrollment.status = :status', { status: filters.status });
    }

    const [data, total] = await queryBuilder
      .orderBy('enrollment.createdAt', 'DESC')
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

  async findOne(id: string): Promise<PlayerEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['team', 'event'],
    });

    if (!enrollment) {
      throw new NotFoundException(`Inscripción con ID ${id} no encontrada`);
    }

    return enrollment;
  }

  async updateStatus(id: string, updateStatusDto: UpdateEnrollmentStatusDto): Promise<PlayerEnrollment> {
    const enrollment = await this.findOne(id);
    enrollment.status = updateStatusDto.status;
    return await this.enrollmentRepository.save(enrollment);
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async isPlayerEnrolledInEvent(playerId: string, eventId: string): Promise<boolean> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        playerId,
        eventId,
        status: EnrollmentStatus.APPROVED,
      },
    });

    return !!enrollment;
  }
}
