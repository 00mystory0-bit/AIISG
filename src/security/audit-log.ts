import { randomUUID } from "node:crypto";

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  outcome: "allowed" | "blocked" | "approved" | "failed";
  detail?: string;
  createdAt: string;
}

export class AuditLog {
  private readonly entries: AuditEntry[] = [];

  record(entry: Omit<AuditEntry, "id" | "createdAt">) {
    const value: AuditEntry = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    this.entries.unshift(value);
    return value;
  }

  list() {
    return this.entries;
  }
}
