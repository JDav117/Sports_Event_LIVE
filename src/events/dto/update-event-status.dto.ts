import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EventStatus } from '../event.entity';

export class UpdateEventStatusDto {
  @ApiProperty({
    description: 'Nuevo estado del evento',
    enum: EventStatus,
    example: EventStatus.LIVE,
  })
  @IsEnum(EventStatus)
  status: EventStatus;
}
