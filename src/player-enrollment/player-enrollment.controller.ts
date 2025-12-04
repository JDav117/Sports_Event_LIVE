import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PlayerEnrollmentService } from './player-enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentStatusDto } from './dto/update-enrollment-status.dto';
import { PlayerEnrollment, EnrollmentStatus } from './player-enrollment.entity';

@ApiTags('PlayerEnrollment')
@Controller('enrollments')
export class PlayerEnrollmentController {
  constructor(private readonly enrollmentService: PlayerEnrollmentService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Inscribir un jugador a un equipo y/o evento',
    description: 'Valida maxPlayers del equipo y maxAttendees del evento'
  })
  @ApiResponse({ status: 201, description: 'Inscripción creada', type: PlayerEnrollment })
  @ApiResponse({ status: 400, description: 'Límite de jugadores alcanzado o ya inscrito' })
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las inscripciones con filtros' })
  @ApiQuery({ name: 'playerId', required: false, description: 'Filtrar por jugador' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filtrar por equipo' })
  @ApiQuery({ name: 'eventId', required: false, description: 'Filtrar por evento' })
  @ApiQuery({ name: 'status', required: false, enum: EnrollmentStatus, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de inscripciones' })
  findAll(
    @Query('playerId') playerId?: string,
    @Query('teamId') teamId?: string,
    @Query('eventId') eventId?: string,
    @Query('status') status?: EnrollmentStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.enrollmentService.findAll({ playerId, teamId, eventId, status, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una inscripción por ID' })
  @ApiResponse({ status: 200, description: 'Inscripción encontrada', type: PlayerEnrollment })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  findOne(@Param('id') id: string) {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Actualizar estado de inscripción (aprobar/rechazar)',
    description: 'Solo el coach puede aprobar o rechazar inscripciones'
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado', type: PlayerEnrollment })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateEnrollmentStatusDto) {
    return this.enrollmentService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una inscripción' })
  @ApiResponse({ status: 200, description: 'Inscripción eliminada' })
  @ApiResponse({ status: 404, description: 'Inscripción no encontrada' })
  remove(@Param('id') id: string) {
    return this.enrollmentService.remove(id);
  }
}
