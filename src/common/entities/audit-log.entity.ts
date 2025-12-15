import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 20, default: 'ws' })
  channel: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  playerId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  eventId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  teamId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ip?: string;

  @Column({ type: 'json' })
  context: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
