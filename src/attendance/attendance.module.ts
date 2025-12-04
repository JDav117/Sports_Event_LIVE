import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from './attendance.entity';
import { EventsModule } from '../events/events.module';
import { SportContextMiddleware } from '../common/middlewares/sport-context.middleware';
import { AuditMiddleware } from '../common/middlewares/audit.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance]),
    EventsModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AuditMiddleware],
  exports: [AttendanceService],
})
export class AttendanceModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SportContextMiddleware, AuditMiddleware)
      .forRoutes(AttendanceController);
  }
}
