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
const initialUserData = {
    routes: [
        { id: 'R001', name: 'Route 1 (Sandton)', positions: [{ lat: -26.1, lng: 28.05 }] },
        { id: 'R002', name: 'Route 2 (Midrand)', positions: [{ lat: -26.0, lng: 28.08 }] },
        { id: 'R003', name: 'Route 3 (Soweto)', positions: [{ lat: -26.25, lng: 28.0 }] },
    ],
    checklist: [
        { id: 'c1', label: 'Waste Carrier License up-to-date', checked: true },
        { id: 'c2', label: 'Vehicle maintenance logs complete', checked: true },
        { id: 'c3', label: 'Driver training records verified', checked: false },
        { id: 'c4', label: 'Waste transfer notes correctly filed', checked: true },
        { id: 'c5', label: 'Health & Safety audit passed', checked: false },
    ],
    transactions: [
        { id: 'T001', date: '2023-10-26', amount: 'R 1,500.00', status: 'Completed' },
        { id: 'T002', date: '2023-10-25', amount: 'R 850.00', status: 'Completed' },
    ],
    listings: [
        { id: 1, name: 'Refurbished Laptops (x10)', price: 'R 15,000', category: 'E-Waste', image: 'https://images.unsplash.com/photo-1517336712462-83603c1f1667?auto=format&fit=crop&q=80&w=800' },
        { id: 2, name: 'Scrap Metal Bundle', price: 'R 5,000', category: 'Metals', image: 'https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&q=80&w=800' },
    ],
    trainingProgress: [
        { id: 1, title: 'Safety in Waste Handling', duration: '45 mins', completed: true, started: true, score: 1.0, quiz: [{ question: 'What is PPE?', options: ['Personal Protective Equipment', 'Public Power Entry'], correctAnswer: 'Personal Protective Equipment' }], badge: { name: 'Safety Star', color: 'text-blue-500' } },
        { id: 2, title: 'e-Waste Sorting', duration: '1 hour', completed: false, started: false, score: 0, quiz: [{ question: 'Is lead harmful?', options: ['Yes', 'No'], correctAnswer: 'Yes' }], badge: { name: 'e-Waste Expert', color: 'text-green-500' } },
    ],
    leaderboard: [
        { rank: 1, name: 'John Doe', points: 1500, avatar: 'https://i.pravatar.cc/150?u=1' },
        { rank: 2, name: 'Jane Smith', points: 1350, avatar: 'https://i.pravatar.cc/150?u=2' },
        { rank: 3, name: 'You', points: 1200, avatar: 'https://i.pravatar.cc/150?u=3' },
    ]
};
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private appData: Record<string, any> = {};
  private auditLogs: AuditEntry[] = [];
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (this.loaded) return;
    this.sessions = new Map(Object.entries(await this.ctx.storage.get<Record<string, SessionInfo>>('sessions') || {}));
    this.appData = await this.ctx.storage.get<Record<string, any>>('appData') || {};
    this.auditLogs = await this.ctx.storage.get<AuditEntry[]>('auditLogs') || [];
    this.loaded = true;
  }
  async getState(userId: string): Promise<Record<string, any>> {
    await this.ensureLoaded();
    if (!this.appData[userId]) {
        this.appData[userId] = JSON.parse(JSON.stringify(initialUserData));
        await this.ctx.storage.put('appData', this.appData);
    }
    return this.appData[userId];
  }
  async setState(userId: string, data: Record<string, any>): Promise<void> {
    await this.ensureLoaded();
    const current = await this.getState(userId);
    const before = JSON.stringify(current);
    this.appData[userId] = { ...current, ...data };
    await this.ctx.storage.put('appData', this.appData);
    await this.addAuditLog({
      id: crypto.randomUUID(),
      userId,
      timestamp: Date.now(),
      action: 'UPDATE_STATE',
      entity: 'USER_APP_DATA',
      before,
      after: JSON.stringify(this.appData[userId])
    });
  }
  async updateChecklistItem(userId: string, id: string, checked: boolean) {
    const current = await this.getState(userId);
    const updated = current.checklist.map((i: any) => i.id === id ? { ...i, checked } : i);
    await this.setState(userId, { checklist: updated });
    return updated.find((i: any) => i.id === id);
  }
  async addTransaction(userId: string, tx: any) {
    const current = await this.getState(userId);
    const newTx = { ...tx, id: `T${Date.now()}` };
    const updated = [newTx, ...current.transactions];
    await this.setState(userId, { transactions: updated });
    return newTx;
  }
  async addListing(userId: string, listing: any) {
    const current = await this.getState(userId);
    const newListing = { ...listing, id: Date.now() };
    const updated = [newListing, ...current.listings];
    await this.setState(userId, { listings: updated });
    return newListing;
  }
  async updateTrainingProgress(userId: string, courseId: number, progress: any) {
    const current = await this.getState(userId);
    const updated = current.trainingProgress.map((c: any) => 
        c.id === courseId ? { ...c, ...progress } : c
    );
    await this.setState(userId, { trainingProgress: updated });
    return updated.find((c: any) => c.id === courseId);
  }
  async addAuditLog(log: AuditEntry): Promise<void> {
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) this.auditLogs.pop();
    await this.ctx.storage.put('auditLogs', this.auditLogs);
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, { id: sessionId, title: title || `Chat ${new Date(now).toLocaleDateString()}`, createdAt: now, lastActive: now });
    await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.ctx.storage.put('sessions', Object.fromEntries(this.sessions));
    }
  }
}