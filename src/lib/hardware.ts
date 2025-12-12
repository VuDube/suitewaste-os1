/* Lightweight browser EventEmitter polyfill providing on/once/off/emit.
   Keeps API surface compatible with Node's EventEmitter for useHardwareManager
   (manager.on, manager.once, manager.off, manager.emit). */
import { errorReporter } from '@/lib/errorReporter';
export class EventEmitter {
  private listeners: Map<string, Set<(...args: any[]) => void>>;
  constructor() {
    this.listeners = new Map();
  }
  public on(event: string, listener: (...args: any[]) => void): this {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);
    return this;
  }
  public once(event: string, listener: (...args: any[]) => void): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    // Attach original for removal checks
    (onceWrapper as any).__original = listener;
    return this.on(event, onceWrapper);
  }
  public off(event: string, listener?: (...args: any[]) => void): this {
    const set = this.listeners.get(event);
    if (!set) return this;
    if (!listener) {
      this.listeners.delete(event);
      return this;
    }
    for (const l of Array.from(set)) {
      if (l === listener || (l as any).__original === listener) {
        set.delete(l);
      }
    }
    if (set.size === 0) this.listeners.delete(event);
    return this;
  }
  public emit(event: string, ...args: any[]): boolean {
    const set = this.listeners.get(event);
    if (!set || set.size === 0) return false;
    // iterate over a copy to avoid issues if listeners mutate during emit
    for (const listener of Array.from(set)) {
      try {
        listener(...args);
      } catch (err) {
        // Preserve async error behavior similar to Node by throwing on next tick
        setTimeout(() => { throw err; }, 0);
      }
    }
    return true;
  }
}
export interface DeviceInfo {
  id: string;
  type: 'printer' | 'camera' | 'gps' | 'poe' | 'usb';
  status: 'connected' | 'offline' | 'error';
  battery?: number;
  connectedAt: number;
}
export class DeviceManager extends EventEmitter {
  private db: IDBDatabase | null = null;
  constructor() {
    super();
    this.initDB();
    window.addEventListener('online', () => this.syncQueue());
  }
  private async initDB() {
    const request = indexedDB.open('hardwareDB', 1);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('deviceQueue')) {
        db.createObjectStore('deviceQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.syncQueue(); // Sync on startup
    };
    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
    };
  }
  public async detectDevices() {
    if ('usb' in navigator && (navigator as any).usb && typeof (navigator as any).usb.getDevices === 'function') {
      try {
        const devices = await (navigator as any).usb.getDevices();
        devices.forEach((d: any) => this.emit('device', { id: d.serialNumber, type: 'usb', status: 'connected', connectedAt: Date.now() }));
      } catch (e) {
        const msg = 'Could not get USB devices. This is expected if not on HTTPS or without user permission.';
        if (import.meta.env.DEV) {
            errorReporter.report({ message: msg, level: 'warning', error: e, url: typeof window !== 'undefined' ? window.location.href : 'unknown', timestamp: new Date().toISOString() });
        } else {
            console.warn(msg, e);
        }
      }
    }
    if ('geolocation' in navigator && navigator.geolocation) {
      navigator.geolocation.watchPosition(
        p => this.emit('gps', { lat: p.coords.latitude, lng: p.coords.longitude }),
        err => {
          const msg = `GPS Error: ${err.message}`;
          errorReporter.report({ message: msg, level: 'error', error: err, url: typeof window !== 'undefined' ? window.location.href : 'unknown', timestamp: new Date().toISOString() });
          this.emit('error', msg);
        }
      );
    }
  }
  public async queueAction(action: { type: string; data: any; retryCount?: number }) {
    if (typeof window !== 'undefined' && !window.location.protocol.startsWith('https:')) {
      console.warn('Hardware actions require an HTTPS connection.');
      this.emit('error', 'httpsRequired');
      return;
    }
    if (!this.db) {
      console.error('Database not initialized. Action not queued.');
      return;
    }
    const jwt = localStorage.getItem('jwt') || 'stub-jwt';
    const actionToQueue = { ...action, data: { ...action.data, auth: jwt }, retryCount: action.retryCount || 0 };
    const transaction = this.db.transaction('deviceQueue', 'readwrite');
    const store = transaction.objectStore('deviceQueue');
    store.add(actionToQueue);
    if (navigator.onLine) {
      await this.syncQueue();
    } else {
      this.emit('info', 'offlineQueue');
    }
  }
  public async syncQueue() {
    if (!this.db || !navigator.onLine) return;
    const transaction = this.db.transaction('deviceQueue', 'readwrite');
    const store = transaction.objectStore('deviceQueue');
    const allActions = store.getAll();
    allActions.onsuccess = async () => {
      for (const item of allActions.result) {
        try {
          const res = await fetch(`/api/hardware/${item.type}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${item.data.auth}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          });
          if (res.ok) {
            this.db?.transaction('deviceQueue', 'readwrite').objectStore('deviceQueue').delete(item.id);
          } else if (item.retryCount < 3) {
            item.retryCount++;
            this.db?.transaction('deviceQueue', 'readwrite').objectStore('deviceQueue').put(item);
            setTimeout(() => this.syncQueue(), 2 ** item.retryCount * 1000); // Exponential backoff
          } else {
             this.db?.transaction('deviceQueue', 'readwrite').objectStore('deviceQueue').delete(item.id);
          }
        } catch (e) {
          console.error('Sync failed:', e);
        }
      }
    };
  }
}