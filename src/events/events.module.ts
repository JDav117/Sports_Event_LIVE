import { Module, MiddlewareConsumer, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { Event } from './event.entity';
import { SportContextMiddleware } from '../common/middlewares/sport-context.middleware';
import { AuditMiddleware } from '../common/middlewares/audit.middleware';
import { CoachGuard } from '../common/guards/coach.guard';
import { PlayerEnrollment } from '../player-enrollment/player-enrollment.entity';
import { PlayerEnrollmentModule } from '../player-enrollment/player-enrollment.module';
import { AuditService } from '../common/services/audit.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, PlayerEnrollment]),
    forwardRef(() => PlayerEnrollmentModule),
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway, AuditMiddleware, CoachGuard, AuditService],
  exports: [EventsService, EventsGateway, AuditService],
})
export class EventsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SportContextMiddleware, AuditMiddleware)
      .forRoutes(EventsController);
  }
}
