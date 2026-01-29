import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, ParticipationType } from './attendance.entity';
import { RecordParticipationDto } from './dto/record-participation.dto';
import { EventsService } from '../events/events.service';
import { EventsGateway } from '../events/events.gateway';
import { EventStatus } from '../events/event.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly eventsService: EventsService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async recordParticipation(
    recordDto: RecordParticipationDto,
  ): Promise<Attendance> {
    const { playerId, playerName, eventId, type, content } = recordDto;

    // Verificar que el evento existe y está en vivo
    const event = await this.eventsService.findOne(eventId);

    if (event.status !== EventStatus.LIVE) {
      throw new BadRequestException(
        'Solo se puede registrar participación en eventos en vivo',
      );
    }

    // Buscar o crear registro de asistencia
    let attendance = await this.attendanceRepository.findOne({
      where: { playerId, eventId },
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        playerId,
        playerName,
        eventId,
        wasPresent: false,
        minutesConnected: 0,
        participationCount: 0,
        participations: [],
      });
    }

    // Agregar participación
    if (!attendance.participations) {
      attendance.participations = [];
    }

    attendance.participations.push({
      type,
      content,
      timestamp: new Date(),
    });

    attendance.participationCount = attendance.participations.length;

    return await this.attendanceRepository.save(attendance);
  }

  async markAttendance(
    eventId: string,
    playerId: string,
    playerName: string,
  ): Promise<Attendance> {
    const event = await this.eventsService.findOne(eventId);

    if (event.status === EventStatus.FINISHED) {
      throw new BadRequestException(
        'No se puede marcar asistencia después de que el evento haya finalizado',
      );
    }

    // Calcular minutos conectados
    const connectionTimeMs = this.eventsGateway.getPlayerConnectionTime(
      eventId,
      playerId,
    );
    const minutesConnected = Math.floor(connectionTimeMs / 60000);

    const minAttendanceMinutes =
      parseInt(process.env.MIN_ATTENDANCE_MINUTES) || 10;

    let attendance = await this.attendanceRepository.findOne({
      where: { playerId, eventId },
    });

    if (!attendance) {
      attendance = this.attendanceRepository.create({
        playerId,
        playerName,
        eventId,
        wasPresent: minutesConnected >= minAttendanceMinutes,
        minutesConnected,
        participationCount: 0,
        participations: [],
      });
    } else {
      attendance.minutesConnected = Math.max(
        attendance.minutesConnected,
        minutesConnected,
      );
      attendance.wasPresent =
        attendance.minutesConnected >= minAttendanceMinutes;
    }

    return await this.attendanceRepository.save(attendance);
  }

  async getEventAttendance(eventId: string): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: { eventId },
      order: { recordedAt: 'DESC' },
    });
  }

  async getPlayerAttendance(playerId: string): Promise<Attendance[]> {
    return await this.attendanceRepository.find({
      where: { playerId },
      relations: ['event'],
      order: { recordedAt: 'DESC' },
    });
  }

  async getAttendanceStats(eventId: string): Promise<{
    totalEnrolled: number;
    totalPresent: number;
    totalAbsent: number;
    attendanceRate: number;
    avgMinutesConnected: number;
    avgParticipations: number;
  }> {
    const attendances = await this.getEventAttendance(eventId);
    const event = await this.eventsService.findOne(eventId);

    const totalPresent = attendances.filter((a) => a.wasPresent).length;
    const totalAbsent = attendances.filter((a) => !a.wasPresent).length;
    const totalEnrolled =
      event.enrollments?.filter((e) => e.status === 'approved').length || 0;

    const avgMinutesConnected =
      attendances.length > 0
        ? attendances.reduce((sum, a) => sum + a.minutesConnected, 0) /
          attendances.length
        : 0;

    const avgParticipations =
      attendances.length > 0
        ? attendances.reduce((sum, a) => sum + a.participationCount, 0) /
          attendances.length
        : 0;

    const attendanceRate =
      totalEnrolled > 0 ? (totalPresent / totalEnrolled) * 100 : 0;

    return {
      totalEnrolled,
      totalPresent,
      totalAbsent,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      avgMinutesConnected: Math.round(avgMinutesConnected * 100) / 100,
      avgParticipations: Math.round(avgParticipations * 100) / 100,
    };
  }

  async finalizeEventAttendance(eventId: string): Promise<void> {
    const event = await this.eventsService.findOne(eventId);

    if (event.status !== EventStatus.FINISHED) {
      throw new BadRequestException(
        'Solo se puede finalizar la asistencia de eventos finalizados',
      );
    }

    const connectedPlayers = this.eventsGateway.getConnectedPlayers(eventId);

    for (const player of connectedPlayers) {
      await this.markAttendance(eventId, player.playerId, player.playerName);
    }
  }
}
