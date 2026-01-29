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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './team.entity';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo equipo' })
  @ApiResponse({
    status: 201,
    description: 'Equipo creado exitosamente',
    type: Team,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todos los equipos con filtros y paginación',
  })
  @ApiQuery({
    name: 'coach',
    required: false,
    description: 'Filtrar por entrenador',
  })
  @ApiQuery({
    name: 'sportType',
    required: false,
    description: 'Filtrar por tipo de deporte',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoría',
  })
  @ApiQuery({
    name: 'tags',
    required: false,
    description: 'Filtrar por etiquetas',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número de página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Elementos por página',
  })
  @ApiResponse({ status: 200, description: 'Lista de equipos' })
  findAll(
    @Query('coach') coach?: string,
    @Query('sportType') sportType?: string,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.teamsService.findAll({
      coach,
      sportType,
      category,
      tags,
      page,
      limit,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un equipo por ID' })
  @ApiResponse({ status: 200, description: 'Equipo encontrado', type: Team })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un equipo' })
  @ApiResponse({ status: 200, description: 'Equipo actualizado', type: Team })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto) {
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un equipo' })
  @ApiResponse({ status: 200, description: 'Equipo eliminado' })
  @ApiResponse({ status: 404, description: 'Equipo no encontrado' })
  remove(@Param('id') id: string) {
    return this.teamsService.remove(id);
  }
}
