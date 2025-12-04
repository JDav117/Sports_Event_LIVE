import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { RecordParticipationDto } from './dto/record-participation.dto';
import { Attendance } from './attendance.entity';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('participation')
  @ApiOperation({ 
    summary: 'Registrar una participación de un jugador',
    description: 'Registra mensajes, feedback táctico, solicitudes de cambio o tiempo fuera'
  })
  @ApiResponse({ status: 201, description: 'Participación registrada', type: Attendance })
  @ApiResponse({ status: 400, description: 'Solo se puede registrar en eventos en vivo' })
  recordParticipation(@Body() recordDto: RecordParticipationDto) {
    return this.attendanceService.recordParticipation(recordDto);
  }

  @Post('mark/:eventId/:playerId')
  @ApiOperation({ 
    summary: 'Marcar asistencia de un jugador',
    description: 'Marca a un jugador como presente si estuvo conectado el tiempo mínimo requerido'
  })
  @ApiParam({ name: 'eventId', description: 'ID del evento' })
  @ApiParam({ name: 'playerId', description: 'ID del jugador' })
  @ApiResponse({ status: 201, description: 'Asistencia marcada', type: Attendance })
  @ApiResponse({ status: 400, description: 'No se puede marcar después de finalizado' })
  markAttendance(
    @Param('eventId') eventId: string,
    @Param('playerId') playerId: string,
    @Query('playerName') playerName: string,
  ) {
    return this.attendanceService.markAttendance(eventId, playerId, playerName);
  }

  @Get('event/:eventId')
  @ApiOperation({ summary: 'Obtener asistencias de un evento' })
  @ApiParam({ name: 'eventId', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Lista de asistencias', type: [Attendance] })
  getEventAttendance(@Param('eventId') eventId: string) {
    return this.attendanceService.getEventAttendance(eventId);
  }

  @Get('player/:playerId')
  @ApiOperation({ summary: 'Obtener asistencias de un jugador' })
  @ApiParam({ name: 'playerId', description: 'ID del jugador' })
  @ApiResponse({ status: 200, description: 'Lista de asistencias', type: [Attendance] })
  getPlayerAttendance(@Param('playerId') playerId: string) {
    return this.attendanceService.getPlayerAttendance(playerId);
  }

  @Get('stats/:eventId')
  @ApiOperation({ 
    summary: 'Obtener estadísticas de asistencia de un evento',
    description: 'Retorna total de presentes, ausentes, tasa de asistencia, promedios, etc.'
  })
  @ApiParam({ name: 'eventId', description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Estadísticas de asistencia' })
  getAttendanceStats(@Param('eventId') eventId: string) {
    return this.attendanceService.getAttendanceStats(eventId);
  }

  @Post('finalize/:eventId')
  @ApiOperation({ 
    summary: 'Finalizar asistencia de un evento',
    description: 'Marca la asistencia de todos los jugadores conectados al finalizar el evento'
  })
  @ApiParam({ name: 'eventId', description: 'ID del evento' })
  @ApiResponse({ status: 201, description: 'Asistencia finalizada' })
  @ApiResponse({ status: 400, description: 'Solo eventos finalizados' })
  finalizeEventAttendance(@Param('eventId') eventId: string) {
    return this.attendanceService.finalizeEventAttendance(eventId);
  }
}
