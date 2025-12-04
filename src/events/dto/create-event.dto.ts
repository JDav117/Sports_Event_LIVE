import { IsString, IsEnum, IsDateString, IsOptional, IsInt, Min, IsUUID, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '../event.entity';

export class CreateEventDto {
  @ApiProperty({ description: 'Nombre del evento', example: 'Entrenamiento Táctico' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Fecha y hora de inicio', example: '2025-12-10T15:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Fecha y hora de fin', example: '2025-12-10T17:00:00Z' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Ubicación del evento', example: 'Estadio Principal' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  location: string;

  @ApiProperty({
    description: 'Tipo de evento',
    enum: EventType,
    example: EventType.TRAINING,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({ description: 'ID del equipo', example: 'uuid' })
  @IsUUID()
  teamId: string;

  @ApiPropertyOptional({ description: 'Número máximo de asistentes', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttendees?: number;

  @ApiPropertyOptional({ description: 'Descripción del evento' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
