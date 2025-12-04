import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Event } from '../events/event.entity';

export enum ParticipationType {
  CHAT_MESSAGE = 'chat_message',
  TACTICAL_FEEDBACK = 'tactical_feedback',
  SUBSTITUTION_REQUEST = 'substitution_request',
  TIMEOUT_REQUEST = 'timeout_request',
}

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string;

  @Column()
  playerName: string;

  @ManyToOne(() => Event, event => event.attendances)
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column()
  eventId: string;

  @Column({ type: 'boolean', default: false })
  wasPresent: boolean;

  @Column({ type: 'int', default: 0 })
  minutesConnected: number;

  @Column({ type: 'int', default: 0 })
  participationCount: number;

  @Column({ type: 'simple-json', nullable: true })
  participations: Array<{
    type: ParticipationType;
    content?: string;
    timestamp: Date;
  }>;

  @CreateDateColumn()
  recordedAt: Date;
}
