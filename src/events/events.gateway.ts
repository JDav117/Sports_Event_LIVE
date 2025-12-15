import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { PlayerEnrollmentService } from '../player-enrollment/player-enrollment.service';
import { AuditService } from '../common/services/audit.service';
import { EventStatus } from './event.entity';

interface PlayerConnection {
  socketId: string;
  playerId: string;
  playerName: string;
  eventId: string;
  joinedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: [
      process.env.CORS_ORIGIN_PLAYERS || 'http://localhost:4200',
      process.env.CORS_ORIGIN_COACHES || 'http://localhost:4201',
    ],
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly enrollmentService: PlayerEnrollmentService,
    private readonly auditService: AuditService,
  ) {}

  @WebSocketServer()
  server: Server;

  // Mapa de conexiones: eventId -> array de PlayerConnection
  private eventRooms: Map<string, PlayerConnection[]> = new Map();
  private eventStatusCache: Map<string, EventStatus> = new Map();

  handleConnection(client: Socket) {
    console.log(`[WS] Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`[WS] Cliente desconectado: ${client.id}`);
    
    // Remover jugador de todas las salas
    this.eventRooms.forEach((players, eventId) => {
      const playerIndex = players.findIndex(p => p.socketId === client.id);
      if (playerIndex !== -1) {
        const player = players[playerIndex];
        players.splice(playerIndex, 1);

        // Notificar a la sala
        this.server.to(eventId).emit('player.left_event', {
          eventId,
          playerId: player.playerId,
          playerName: player.playerName,
          timestamp: new Date(),
        });

        this.updateConnectedPlayers(eventId);
      }
    });
  }

  @SubscribeMessage('join_event')
  async handleJoinEvent(
    @MessageBody() data: { eventId: string; playerId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, playerId, playerName } = data;

    // Verificar inscripcion aprobada antes de permitir el acceso
    const isEnrolled = await this.enrollmentService.isPlayerEnrolledInEvent(playerId, eventId);

    if (!isEnrolled) {
      const reason = `Jugador ${playerId} intentó unirse a evento ${eventId} sin inscripción aprobada`;
      await this.auditService.logWs('UNAUTHORIZED_EVENT_ACCESS', {
        playerId,
        playerName,
        eventId,
        socketId: client.id,
        ip: client.handshake.address,
        reason,
      });

      return this.emitJoinDenied(client, {
        eventId,
        playerId,
        playerName,
        reason: 'Not enrolled',
      });
    }

    // Unir al cliente a la sala del evento
    client.join(eventId);

    // Registrar conexión
    if (!this.eventRooms.has(eventId)) {
      this.eventRooms.set(eventId, []);
    }

    const players = this.eventRooms.get(eventId)!;
    const existingPlayer = players.find(p => p.playerId === playerId);

    if (!existingPlayer) {
      players.push({
        socketId: client.id,
        playerId,
        playerName,
        eventId,
        joinedAt: new Date(),
      });
    }

    // Notificar a todos en la sala
    this.server.to(eventId).emit('player.joined_event', {
      eventId,
      playerId,
      playerName,
      timestamp: new Date(),
    });

    this.updateConnectedPlayers(eventId);

    console.log(`[WS] Jugador ${playerName} (${playerId}) se unió al evento ${eventId}`);

    return {
      success: true,
      message: 'Unido al evento exitosamente',
      connectedPlayers: players.length,
    };
  }

  @SubscribeMessage('leave_event')
  handleLeaveEvent(
    @MessageBody() data: { eventId: string; playerId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, playerId } = data;
    console.log(`[WS] leave_event received: event ${eventId}, player ${playerId}, socket ${client.id}`);

    client.leave(eventId);

    let removedPlayer: PlayerConnection | undefined;

    if (this.eventRooms.has(eventId)) {
      const players = this.eventRooms.get(eventId)!;
      const playerIndex = players.findIndex(p => p.playerId === playerId || p.socketId === client.id);

      if (playerIndex !== -1) {
        removedPlayer = players[playerIndex];
        players.splice(playerIndex, 1);

        const payload = {
          eventId,
          playerId: removedPlayer.playerId,
          playerName: removedPlayer.playerName,
          timestamp: new Date(),
        };

        client.emit('player.left_event', payload);
        this.server.to(eventId).emit('player.left_event', payload);

        console.log(`[WS] leave_event removed: event ${eventId}, player ${removedPlayer.playerId}, socket ${client.id}`);
      }
    }

    // Siempre notificar la métrica al cliente que sale y al resto de la sala
    this.updateConnectedPlayers(eventId, client);

    return { success: true, message: 'Saliste del evento' };
  }

  @UseGuards(ThrottlerGuard)
  @SubscribeMessage('send_chat_message')
  @Throttle({ chat: { ttl: 10000, limit: 5 } })
  handleChatMessage(
    @MessageBody() data: { eventId: string; playerId: string; playerName: string; message: string; isCoachFeedback?: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, playerId, playerName, message, isCoachFeedback } = data;

    const chatMessage = {
      eventId,
      playerId,
      playerName,
      message,
      isCoachFeedback: isCoachFeedback || false,
      timestamp: new Date(),
    };

    this.server.to(eventId).emit('event.chat_message', chatMessage);

    console.log(`[WS] Chat en evento ${eventId}: ${playerName}: ${message}`);

    return { success: true };
  }

  @UseGuards(ThrottlerGuard)
  @SubscribeMessage('request_substitution')
  @Throttle({ chat: { ttl: 10000, limit: 3 } })
  handleSubstitutionRequest(
    @MessageBody() data: { eventId: string; playerId: string; playerName: string; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, playerId, playerName, reason } = data;

    const substitutionRequest = {
      eventId,
      playerId,
      playerName,
      reason: reason || 'Sin razón especificada',
      timestamp: new Date(),
    };

    this.server.to(eventId).emit('event.substitution_requested', substitutionRequest);

    console.log(`[WS] Solicitud de cambio en evento ${eventId}: ${playerName}`);

    return { success: true, message: 'Solicitud de cambio enviada' };
  }

  @UseGuards(ThrottlerGuard)
  @SubscribeMessage('request_timeout')
  @Throttle({ chat: { ttl: 10000, limit: 3 } })
  handleTimeoutRequest(
    @MessageBody() data: { eventId: string; playerId: string; playerName: string; reason?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, playerId, playerName, reason } = data;

    const timeoutRequest = {
      eventId,
      playerId,
      playerName,
      reason: reason || 'Sin razón especificada',
      timestamp: new Date(),
    };

    this.server.to(eventId).emit('event.timeout_requested', timeoutRequest);

    console.log(`[WS] Solicitud de tiempo fuera en evento ${eventId}: ${playerName}`);

    return { success: true, message: 'Solicitud de tiempo fuera enviada' };
  }

  // Métodos auxiliares para notificar cambios de estado del evento
  notifyEventStarted(eventId: string) {
    if (this.hasSameStatus(eventId, EventStatus.LIVE)) {
      return;
    }

    this.eventStatusCache.set(eventId, EventStatus.LIVE);
    this.server.to(eventId).emit('event.started', {
      eventId,
      timestamp: new Date(),
    });
  }

  notifyEventEnded(eventId: string) {
    if (this.hasSameStatus(eventId, EventStatus.FINISHED)) {
      return;
    }

    this.eventStatusCache.set(eventId, EventStatus.FINISHED);
    this.server.to(eventId).emit('event.ended', {
      eventId,
      timestamp: new Date(),
    });
  }

  private updateConnectedPlayers(eventId: string, client?: Socket) {
    const players = this.eventRooms.get(eventId) || [];
    const payload = {
      eventId,
      connectedPlayers: players.length,
      players: players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        joinedAt: p.joinedAt,
      })),
    };

    this.server.to(eventId).emit('event.connected_players', payload);

    if (client) {
      client.emit('event.connected_players', payload);
    }
  }

  // Método para obtener jugadores conectados (útil para el servicio de asistencia)
  getConnectedPlayers(eventId: string): PlayerConnection[] {
    return this.eventRooms.get(eventId) || [];
  }

  // Método para obtener el tiempo de conexión de un jugador
  getPlayerConnectionTime(eventId: string, playerId: string): number {
    const players = this.eventRooms.get(eventId) || [];
    const player = players.find(p => p.playerId === playerId);
    
    if (player) {
      return Date.now() - player.joinedAt.getTime();
    }
    
    return 0;
  }

  private emitJoinDenied(
    client: Socket,
    payload: { eventId: string; playerId: string; playerName: string; reason: string },
  ) {
    const response = {
      success: false,
      code: 'UNAUTHORIZED_EVENT_ACCESS',
      message: payload.reason,
      eventId: payload.eventId,
      playerId: payload.playerId,
      playerName: payload.playerName,
      timestamp: new Date(),
    };

    client.emit('event.join_denied', response);
    return response;
  }

  private hasSameStatus(eventId: string, status: EventStatus): boolean {
    return this.eventStatusCache.get(eventId) === status;
  }
}
