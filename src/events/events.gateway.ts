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
  @WebSocketServer()
  server: Server;

  // Mapa de conexiones: eventId -> array de PlayerConnection
  private eventRooms: Map<string, PlayerConnection[]> = new Map();

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
  handleJoinEvent(
    @MessageBody() data: { eventId: string; playerId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { eventId, playerId, playerName } = data;

    // Unir al cliente a la sala del evento
    client.join(eventId);

    // Registrar conexión
    if (!this.eventRooms.has(eventId)) {
      this.eventRooms.set(eventId, []);
    }

    const players = this.eventRooms.get(eventId);
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

    client.leave(eventId);

    if (this.eventRooms.has(eventId)) {
      const players = this.eventRooms.get(eventId);
      const playerIndex = players.findIndex(p => p.playerId === playerId);

      if (playerIndex !== -1) {
        const player = players[playerIndex];
        players.splice(playerIndex, 1);

        this.server.to(eventId).emit('player.left_event', {
          eventId,
          playerId,
          playerName: player.playerName,
          timestamp: new Date(),
        });

        this.updateConnectedPlayers(eventId);
      }
    }

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
    this.server.to(eventId).emit('event.started', {
      eventId,
      timestamp: new Date(),
    });
  }

  notifyEventEnded(eventId: string) {
    this.server.to(eventId).emit('event.ended', {
      eventId,
      timestamp: new Date(),
    });
  }

  private updateConnectedPlayers(eventId: string) {
    const players = this.eventRooms.get(eventId) || [];
    this.server.to(eventId).emit('event.connected_players', {
      eventId,
      connectedPlayers: players.length,
      players: players.map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        joinedAt: p.joinedAt,
      })),
    });
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
}
