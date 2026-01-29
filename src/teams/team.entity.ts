import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { PlayerEnrollment } from '../player-enrollment/player-enrollment.entity';

export enum SportType {
  FOOTBALL = 'fútbol',
  BASKETBALL = 'básquet',
  VOLLEYBALL = 'voleibol',
  TENNIS = 'tenis',
  HANDBALL = 'balonmano',
  OTHER = 'otro',
}

export enum Category {
  SUB_18 = 'sub-18',
  SUB_21 = 'sub-21',
  LIBRE = 'libre',
  FEMENINO = 'femenino',
  MASCULINO = 'masculino',
  MIXTO = 'mixto',
}

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Category,
  })
  category: Category;

  @Column()
  coach: string; // Nombre o ID del entrenador

  @Column({ type: 'int' })
  maxPlayers: number;

  @Column({
    type: 'enum',
    enum: SportType,
  })
  sportType: SportType;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // entrenamiento, torneo, amistoso, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Event, (event) => event.team)
  events: Event[];

  @OneToMany(() => PlayerEnrollment, (enrollment) => enrollment.team)
  enrollments: PlayerEnrollment[];
}
