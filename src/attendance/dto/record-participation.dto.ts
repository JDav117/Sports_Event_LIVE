import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipationType } from '../attendance.entity';

export class RecordParticipationDto {
  @ApiProperty({ description: 'ID del jugador' })
  @IsString()
  playerId: string;

  @ApiProperty({ description: 'Nombre del jugador' })
  @IsString()
  playerName: string;

  @ApiProperty({ description: 'ID del evento' })
  @IsUUID()
  eventId: string;

  @ApiProperty({
    description: 'Tipo de participación',
    enum: ParticipationType,
    example: ParticipationType.CHAT_MESSAGE,
  })
  @IsEnum(ParticipationType)
  type: ParticipationType;

  @ApiPropertyOptional({
    description: 'Contenido de la participación (mensaje, feedback, etc.)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  content?: string;
}
