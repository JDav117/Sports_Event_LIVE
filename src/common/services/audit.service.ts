import { Injectable } from '@nestjs/common';

interface AuditEntry {
  timestamp: Date;
  action: string;
  context: Record<string, any>;
}

@Injectable()
export class AuditService {
  private logs: AuditEntry[] = [];
  private readonly maxLogs = 1000;

  logWs(action: string, context: Record<string, any>) {
    const entry: AuditEntry = { timestamp: new Date(), action, context };
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.warn(`[AUDIT][WS] ${action}`, {
      ...context,
      timestamp: entry.timestamp.toISOString(),
    });
  }

  getLogs(limit = 100): AuditEntry[] {
    return this.logs.slice(-limit).reverse();
  }
}
