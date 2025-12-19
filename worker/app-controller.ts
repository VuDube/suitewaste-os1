import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo } from './types';
import type { Env } from './core-utils';
export interface AuditEntry {
  id: string;
  userId: string;
  timestamp: number;
  action: string;
  entity: string;
  before: string;
  after: string;
}
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private loaded = false;
  private appData: Record<string, any> = {};
  private auditLogs: AuditEntry[] = [];
  private loadedAppData = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {};
      this.sessions = new Map(Object.entries(stored));
      this.loaded = true;
    }
    if (!this.loadedAppData) {
      this.appData = await this.ctx.storage.get('appData') || {};
      this.auditLogs = await this.ctx.storage.get('auditLogs') || [];
      this.loadedAppData = true;
    }
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
  }
  private async persistAppData(): Promise<void> {
    await this.ctx.storage.put('appData', this.appData);
    await this.ctx.storage.put('auditLogs', this.auditLogs);
  }
  async getState(userId: string): Promise<Record<string, any>> {
    await this.ensureLoaded();
    return this.appData[userId] || {};
  }
  async setState(userId: string, data: Record<string, any>): Promise<void> {
    await this.ensureLoaded();
    const before = JSON.stringify(this.appData[userId] || {});
    this.appData[userId] = { ...(this.appData[userId] || {}), ...data };
    const after = JSON.stringify(this.appData[userId]);
    // Auto-audit for POPIA
    await this.addAuditLog({
      id: crypto.randomUUID(),
      userId,
      timestamp: Date.now(),
      action: 'UPDATE_STATE',
      entity: 'USER_APP_DATA',
      before,
      after
    });
    await this.persistAppData();
  }
  async addAuditLog(log: AuditEntry): Promise<void> {
    await this.ensureLoaded();
    this.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (this.auditLogs.length > 1000) this.auditLogs.pop();
    await this.persistAppData();
  }
  async getAuditLogs(userId?: string): Promise<AuditEntry[]> {
    await this.ensureLoaded();
    if (!userId) return this.auditLogs;
    return this.auditLogs.filter(l => l.userId === userId);
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
}