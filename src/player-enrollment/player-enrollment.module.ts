import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEnrollmentService } from './player-enrollment.service';
import { PlayerEnrollmentController } from './player-enrollment.controller';
import { PlayerEnrollment } from './player-enrollment.entity';
import { TeamsModule } from '../teams/teams.module';
import { EventsModule } from '../events/events.module';
import { SportContextMiddleware } from '../common/middlewares/sport-context.middleware';
import { AuditMiddleware } from '../common/middlewares/audit.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([PlayerEnrollment]),
    TeamsModule,
    EventsModule,
  ],
  controllers: [PlayerEnrollmentController],
  providers: [PlayerEnrollmentService, AuditMiddleware],
  exports: [PlayerEnrollmentService],
})
export class PlayerEnrollmentModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SportContextMiddleware, AuditMiddleware)
      .forRoutes(PlayerEnrollmentController);
  }
}
