import {
  IsString,
  IsEnum,
  IsUUID,
  IsEmail,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EnrollmentType } from '../player-enrollment.entity';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'ID del jugador', example: 'player-uuid' })
  @IsString()
  playerId: string;

  @ApiProperty({
    description: 'Nombre del jugador',
    example: 'Carlos Martínez',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  playerName: string;

  @ApiProperty({
    description: 'Email del jugador',
    example: 'carlos@example.com',
  })
  @IsEmail()
  playerEmail: string;

  @ApiProperty({
    description: 'Tipo de inscripción',
    enum: EnrollmentType,
    example: EnrollmentType.TEAM,
  })
  @IsEnum(EnrollmentType)
  enrollmentType: EnrollmentType;

  @ApiPropertyOptional({
    description: 'ID del equipo (requerido si enrollmentType es team o both)',
  })
  @IsOptional()
  @IsUUID()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'ID del evento (requerido si enrollmentType es event o both)',
  })
  @IsOptional()
  @IsUUID()
  eventId?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
