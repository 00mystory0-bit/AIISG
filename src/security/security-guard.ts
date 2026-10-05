import { randomUUID } from "node:crypto";

export type ThreatSeverity = "info" | "low" | "medium" | "high" | "critical";
export type ThreatStatus = "detected" | "blocked" | "approved" | "dismissed";

export interface SecurityEvent {
  id: string;
  source: string;
  category: string;
  severity: ThreatSeverity;
  status: ThreatStatus;
  description: string;
  createdAt: string;
  requiresApproval: boolean;
}

const severityScore: Record<ThreatSeverity, number> = {
  info: 0, low: 20, medium: 45, high: 75, critical: 100
};

export class SecurityGuard {
  private readonly events: SecurityEvent[] = [];

  detect(input: {
    source: string;
    category: string;
    severity: ThreatSeverity;
    description: string;
  }) {
    const requiresApproval = severityScore[input.severity] >= 75;
    const event: SecurityEvent = {
      id: randomUUID(),
      ...input,
      status: requiresApproval ? "detected" : "approved",
      createdAt: new Date().toISOString(),
      requiresApproval
    };
    this.events.unshift(event);
    return event;
  }

  approve(id: string) {
    const event = this.events.find(x => x.id === id);
    if (!event) throw new Error("Security event not found");
    event.status = "approved";
    return event;
  }

  block(id: string) {
    const event = this.events.find(x => x.id === id);
    if (!event) throw new Error("Security event not found");
    event.status = "blocked";
    return event;
  }

  list() {
    return this.events;
  }

  score(severity: ThreatSeverity) {
    return severityScore[severity];
  }
}
