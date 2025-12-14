import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { Event, EventType, EventStatus } from './event.entity';
import { CoachGuard } from '../common/guards/coach.guard';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo evento deportivo' })
  @ApiResponse({ status: 201, description: 'Evento creado exitosamente', type: Event })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos con filtros y paginación' })
  @ApiQuery({ name: 'teamId', required: false, description: 'Filtrar por equipo' })
  @ApiQuery({ name: 'type', required: false, enum: EventType, description: 'Filtrar por tipo de evento' })
  @ApiQuery({ name: 'status', required: false, enum: EventStatus, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filtrar desde fecha (ISO)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filtrar hasta fecha (ISO)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Elementos por página' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  findAll(
    @Query('teamId') teamId?: string,
    @Query('type') type?: EventType,
    @Query('status') status?: EventStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.eventsService.findAll({ teamId, type, status, startDate, endDate, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento por ID' })
  @ApiResponse({ status: 200, description: 'Evento encontrado', type: Event })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un evento' })
  @ApiResponse({ status: 200, description: 'Evento actualizado', type: Event })
  @ApiResponse({ status: 400, description: 'No se puede editar evento live o finished' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Cambiar estado del evento (solo coach)',
    description: 'Permite al entrenador cambiar el estado del evento a live, finished, cancelled, etc.'
  })
  @ApiResponse({ status: 200, description: 'Estado actualizado', type: Event })
  @ApiResponse({ status: 400, description: 'No se puede iniciar antes del margen de tiempo' })
  @ApiResponse({ status: 403, description: 'Solo el coach puede cambiar a live/finished' })
  @UseGuards(CoachGuard)
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateEventStatusDto) {
    return this.eventsService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un evento' })
  @ApiResponse({ status: 200, description: 'Evento eliminado' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar evento en vivo' })
  @ApiResponse({ status: 404, description: 'Evento no encontrado' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
