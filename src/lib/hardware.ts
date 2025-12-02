import EventEmitter from 'events';
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
    if ('usb' in navigator && navigator.usb) {
      try {
        const devices = await navigator.usb.getDevices();
        devices.forEach(d => this.emit('device', { id: d.serialNumber, type: 'usb', status: 'connected', connectedAt: Date.now() }));
      } catch (e) { console.warn('Could not get USB devices', e); }
    }
    if ('geolocation' in navigator && navigator.geolocation) {
      navigator.geolocation.watchPosition(p => this.emit('gps', { lat: p.coords.latitude, lng: p.coords.longitude }));
    }
  }
  public async queueAction(action: { type: string; data: any; retryCount?: number }) {
    if (!location.protocol.startsWith('https:')) {
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