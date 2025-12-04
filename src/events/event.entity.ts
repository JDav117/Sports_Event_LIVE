import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from '../teams/team.entity';
import { PlayerEnrollment } from '../player-enrollment/player-enrollment.entity';
import { Attendance } from '../attendance/attendance.entity';

export enum EventType {
  TRAINING = 'training',
  MATCH = 'match',
  FRIENDLY = 'friendly',
  TOURNAMENT = 'tournament',
}

export enum EventStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column()
  location: string;

  @Column({
    type: 'text',
    enum: EventType,
  })
  type: EventType;

  @Column({
    type: 'text',
    enum: EventStatus,
    default: EventStatus.SCHEDULED,
  })
  status: EventStatus;

  @Column({ type: 'int', nullable: true })
  maxAttendees: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Team, team => team.events)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column()
  teamId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PlayerEnrollment, enrollment => enrollment.event)
  enrollments: PlayerEnrollment[];

  @OneToMany(() => Attendance, attendance => attendance.event)
  attendances: Attendance[];
}
