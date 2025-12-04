import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EnrollmentStatus } from '../player-enrollment.entity';

export class UpdateEnrollmentStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la inscripción',
    enum: EnrollmentStatus,
    example: EnrollmentStatus.APPROVED,
  })
  @IsEnum(EnrollmentStatus)
  status: EnrollmentStatus;
}
