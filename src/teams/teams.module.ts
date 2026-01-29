import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { Team } from './team.entity';
import { SportContextMiddleware } from '../common/middlewares/sport-context.middleware';
import { AuditMiddleware } from '../common/middlewares/audit.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([Team])],
  controllers: [TeamsController],
  providers: [TeamsService, AuditMiddleware],
  exports: [TeamsService],
})
export class TeamsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SportContextMiddleware, AuditMiddleware)
      .forRoutes(TeamsController);
  }
}
