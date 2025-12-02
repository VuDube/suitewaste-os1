import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DeviceInfo } from '@/lib/hardware';
export type WindowState = 'minimized' | 'maximized' | 'normal';
export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
  zIndex: number;
  state: WindowState;
  desktopId: string;
}
export interface Notification {
  id: string;
  appId: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  timestamp: number;
}
export interface Desktop {
  id: string;
  name: string;
}
interface DesktopState {
  windows: WindowInstance[];
  notifications: Notification[];
  activeWindowId: string | null;
  nextZIndex: number;
  wallpaper: string;
  desktops: Desktop[];
  currentDesktopId: string;
  nextDesktopId: number;
  appsState: Record<string, any>;
  hardwareState: {
    devices: Map<string, DeviceInfo>;
  };
}
interface DesktopActions {
  openApp: (appId: string, meta?: { title?: string; icon?: React.ComponentType<{ className?: string }> }) => void;
  closeApp: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  setWindowState: (windowId: string, state: WindowState) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number | string; height: number | string }) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  setWallpaper: (wallpaperUrl: string) => void;
  addDesktop: () => void;
  removeDesktop: (desktopId: string) => void;
  setCurrentDesktop: (desktopId: string) => void;
  updateAppState: (appId: string, data: any) => void;
  updateHardwareState: (devices: Map<string, DeviceInfo>) => void;
  notifyHardwareEvent: (event: string, deviceId: string) => void;
}
const initialState: DesktopState = {
  windows: [],
  notifications: [],
  activeWindowId: null,
  nextZIndex: 100,
  wallpaper: '',
  desktops: [{ id: '1', name: 'os.desktop.1' }],
  currentDesktopId: '1',
  nextDesktopId: 2,
  appsState: {},
  hardwareState: {
    devices: new Map(),
  },
};
export const useDesktopStore = create<DesktopState & DesktopActions>()(
  immer((set, get) => ({
    ...initialState,
    openApp: (appId, meta) => {
      const currentDesktopId = get().currentDesktopId;
      const existingWindow = get().windows.find((w) => w.appId === appId && w.desktopId === currentDesktopId);
      if (existingWindow) {
        get().focusWindow(existingWindow.id);
        if (existingWindow.state === 'minimized') get().setWindowState(existingWindow.id, 'normal');
        return;
      }
      const newWindow: WindowInstance = {
        id: `win_${crypto.randomUUID()}`,
        appId: appId,
        title: meta?.title ?? appId,
        icon: meta?.icon ?? (() => null),
        position: { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 },
        size: { width: 800, height: 600 },
        zIndex: get().nextZIndex,
        state: 'normal',
        desktopId: currentDesktopId,
      };
      set((state) => {
        state.windows.push(newWindow);
        state.activeWindowId = newWindow.id;
        state.nextZIndex += 1;
      });
    },
    closeApp: (windowId) => set((state) => {
      state.windows = state.windows.filter((w) => w.id !== windowId);
      if (state.activeWindowId === windowId) {
        const windowsOnCurrentDesktop = state.windows.filter(w => w.desktopId === state.currentDesktopId);
        state.activeWindowId = windowsOnCurrentDesktop.length > 0 ? windowsOnCurrentDesktop.sort((a, b) => a.zIndex - b.zIndex).pop()!.id : null;
      }
    }),
    focusWindow: (windowId) => set((state) => {
      const targetWindow = state.windows.find((w) => w.id === windowId);
      if (!targetWindow || targetWindow.zIndex === state.nextZIndex - 1) {
        state.activeWindowId = windowId;
        return;
      }
      targetWindow.zIndex = state.nextZIndex;
      state.nextZIndex += 1;
      state.activeWindowId = windowId;
    }),
    setWindowState: (windowId, windowState) => set((state) => {
      const window = state.windows.find((w) => w.id === windowId);
      if (window) {
        window.state = windowState;
        if (windowState !== 'minimized') {
          if (window.zIndex !== state.nextZIndex - 1) {
            window.zIndex = state.nextZIndex;
            state.nextZIndex += 1;
          }
          state.activeWindowId = windowId;
        }
      }
    }),
    updateWindowPosition: (windowId, position) => set((state) => {
      const window = state.windows.find((w) => w.id === windowId);
      if (window) window.position = position;
    }),
    updateWindowSize: (windowId, size) => set((state) => {
      const window = state.windows.find((w) => w.id === windowId);
      if (window) window.size = size;
    }),
    addNotification: (notification) => set((state) => {
      state.notifications.unshift({ ...notification, id: `notif_${crypto.randomUUID()}`, timestamp: Date.now() });
      if (state.notifications.length > 20) state.notifications.pop();
    }),
    removeNotification: (notificationId) => set((state) => {
      state.notifications = state.notifications.filter((n) => n.id !== notificationId);
    }),
    clearNotifications: () => set((state) => { state.notifications = []; }),
    setWallpaper: (wallpaperUrl) => set({ wallpaper: wallpaperUrl }),
    addDesktop: () => set((state) => {
      const newDesktopId = state.nextDesktopId.toString();
      state.desktops.push({ id: newDesktopId, name: `os.desktop.${newDesktopId}` });
      state.nextDesktopId += 1;
      state.currentDesktopId = newDesktopId;
    }),
    removeDesktop: (desktopId) => {
      if (get().desktops.length <= 1) return;
      set((state) => {
        const fallbackId = state.desktops.find(d => d.id !== desktopId)!.id;
        state.windows.forEach(w => { if (w.desktopId === desktopId) w.desktopId = fallbackId; });
        state.desktops = state.desktops.filter((d) => d.id !== desktopId);
        if (state.currentDesktopId === desktopId) state.currentDesktopId = fallbackId;
      });
    },
    setCurrentDesktop: (desktopId) => set({ currentDesktopId: desktopId, activeWindowId: null }),
    updateAppState: (appId, data) => set((state) => {
      state.appsState[appId] = { ...state.appsState[appId], ...data };
    }),
    updateHardwareState: (devices) => set((state) => {
      state.hardwareState.devices = devices;
    }),
    notifyHardwareEvent: (event, deviceId) => {
      // This is a placeholder for more complex logic.
      // For now, it just adds a generic notification.
      get().addNotification({
        appId: 'system',
        icon: () => null, // Placeholder
        title: `Hardware Event: ${event}`,
        message: `Device: ${deviceId}`,
      });
    },
  }))
);