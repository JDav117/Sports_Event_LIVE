import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security - Helmet
  app.use(helmet());

  // CORS Configuration
  const corsOrigins = [
    process.env.CORS_ORIGIN_PLAYERS || 'http://localhost:4200',
    process.env.CORS_ORIGIN_COACHES || 'http://localhost:4201',
  ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Team-Id', 'X-Event-Id'],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Plataforma de Eventos Deportivos en Vivo')
    .setDescription(
      'API para gestión de equipos, eventos deportivos y seguimiento de asistencia y participación en tiempo real.\n\n' +
      '## WebSocket Events\n\n' +
      'El sistema utiliza WebSockets para comunicación en tiempo real. Conectarse a: `ws://localhost:3000`\n\n' +
      '### Eventos del Cliente al Servidor:\n' +
      '- `join_event`: Unirse a una sala de evento\n' +
      '  ```json\n' +
      '  { "eventId": "uuid", "playerId": "uuid", "playerName": "string" }\n' +
      '  ```\n' +
      '- `leave_event`: Salir de una sala de evento\n' +
      '  ```json\n' +
      '  { "eventId": "uuid", "playerId": "uuid" }\n' +
      '  ```\n' +
      '- `send_chat_message`: Enviar mensaje al chat\n' +
      '  ```json\n' +
      '  { "eventId": "uuid", "playerId": "uuid", "message": "string", "isCoachFeedback": boolean }\n' +
      '  ```\n' +
      '- `request_substitution`: Solicitar cambio\n' +
      '  ```json\n' +
      '  { "eventId": "uuid", "playerId": "uuid", "reason": "string" }\n' +
      '  ```\n' +
      '- `request_timeout`: Solicitar tiempo fuera\n' +
      '  ```json\n' +
      '  { "eventId": "uuid", "playerId": "uuid", "reason": "string" }\n' +
      '  ```\n\n' +
      '### Eventos del Servidor al Cliente:\n' +
      '- `player.joined_event`: Un jugador se unió al evento\n' +
      '- `player.left_event`: Un jugador salió del evento\n' +
      '- `event.chat_message`: Nuevo mensaje en el chat\n' +
      '- `event.substitution_requested`: Solicitud de cambio\n' +
      '- `event.timeout_requested`: Solicitud de tiempo fuera\n' +
      '- `event.started`: Evento iniciado\n' +
      '- `event.ended`: Evento finalizado\n' +
      '- `event.connected_players`: Actualización de jugadores conectados\n'
    )
    .setVersion('1.0')
    .addTag('Teams', 'Gestión de equipos deportivos')
    .addTag('Events', 'Gestión de eventos deportivos')
    .addTag('PlayerEnrollment', 'Inscripción de jugadores')
    .addTag('Attendance', 'Control de asistencia y participación')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Aplicación ejecutándose en: http://localhost:${port}`);
  console.log(`📚 Documentación Swagger: http://localhost:${port}/api/docs`);
  console.log(`🔌 WebSocket Server: ws://localhost:${port}`);
  console.log(`\n🌐 CORS habilitado para:`);
  corsOrigins.forEach(origin => console.log(`   - ${origin}`));
}

bootstrap();
