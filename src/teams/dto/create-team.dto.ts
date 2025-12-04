import { IsString, IsEnum, IsInt, Min, IsArray, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SportType, Category } from '../team.entity';

export class CreateTeamDto {
  @ApiProperty({ description: 'Nombre del equipo', example: 'Tigres FC' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Categoría del equipo',
    enum: Category,
    example: Category.SUB_18,
  })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ description: 'Nombre del entrenador', example: 'Juan Pérez' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  coach: string;

  @ApiProperty({ description: 'Número máximo de jugadores', example: 25, minimum: 5 })
  @IsInt()
  @Min(5)
  maxPlayers: number;

  @ApiProperty({
    description: 'Tipo de deporte',
    enum: SportType,
    example: SportType.FOOTBALL,
  })
  @IsEnum(SportType)
  sportType: SportType;

  @ApiPropertyOptional({
    description: 'Etiquetas del equipo',
    example: ['entrenamiento', 'torneo'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Descripción del equipo' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
