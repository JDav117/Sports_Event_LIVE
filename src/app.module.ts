import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { TeamsModule } from './teams/teams.module';
import { EventsModule } from './events/events.module';
import { PlayerEnrollmentModule } from './player-enrollment/player-enrollment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { EventsGateway } from './events/events.gateway';
import { SportContextMiddleware } from './common/middlewares/sport-context.middleware';
import { AuditMiddleware } from './common/middlewares/audit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any || 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'sports_events',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Solo para desarrollo - crear tablas automáticamente
      logging: false,
      charset: 'utf8mb4',
      // Configuración para manejar enums correctamente con MySQL/MariaDB
      supportBigNumbers: true,
      bigNumberStrings: false,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: parseInt(process.env.RATE_LIMIT_TTL) || 60000,
        limit: parseInt(process.env.RATE_LIMIT_MAX) || 100,
      },
      {
        name: 'chat',
        ttl: parseInt(process.env.CHAT_RATE_LIMIT_TTL) || 10000,
        limit: parseInt(process.env.CHAT_RATE_LIMIT_MAX) || 5,
      },
    ]),
    TeamsModule,
    EventsModule,
    PlayerEnrollmentModule,
    AttendanceModule,
  ],
  providers: [EventsGateway],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar middlewares a todas las rutas
    consumer
      .apply(SportContextMiddleware, AuditMiddleware)
      .forRoutes('*');
  }
}
