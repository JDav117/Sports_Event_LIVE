import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { Event } from './event.entity';
import { SportContextMiddleware } from '../common/middlewares/sport-context.middleware';
import { AuditMiddleware } from '../common/middlewares/audit.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway, AuditMiddleware],
  exports: [EventsService, EventsGateway],
})
export class EventsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SportContextMiddleware, AuditMiddleware)
      .forRoutes(EventsController);
  }
}
