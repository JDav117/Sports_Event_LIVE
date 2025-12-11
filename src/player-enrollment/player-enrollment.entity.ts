import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Team } from '../teams/team.entity';
import { Event } from '../events/event.entity';

export enum EnrollmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum EnrollmentType {
  TEAM = 'team',
  EVENT = 'event',
  BOTH = 'both',
}

@Entity('player_enrollments')
export class PlayerEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  playerId: string; // En producción sería un UUID de usuario

  @Column()
  playerName: string;

  @Column()
  playerEmail: string;

  @Column({
    type: 'enum',
    enum: EnrollmentType,
  })
  enrollmentType: EnrollmentType;

  @Column({
    type: 'enum',
    enum: EnrollmentStatus,
    default: EnrollmentStatus.PENDING,
  })
  status: EnrollmentStatus;

  @ManyToOne(() => Team, team => team.enrollments, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ nullable: true })
  teamId: string;

  @ManyToOne(() => Event, event => event.enrollments, { nullable: true })
  @JoinColumn({ name: 'eventId' })
  event: Event;

  @Column({ nullable: true })
  eventId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
