import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { APPS, AppConfig } from '@/config/apps.config';
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
}
export interface Notification {
  id: string;
  appId: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  timestamp: number;
}
interface DesktopState {
  windows: WindowInstance[];
  notifications: Notification[];
  activeWindowId: string | null;
  nextZIndex: number;
  wallpaper: string;
}
interface DesktopActions {
  openApp: (appId: string) => void;
  closeApp: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  setWindowState: (windowId: string, state: WindowState) => void;
  updateWindowPosition: (windowId: string, position: { x: number; y: number }) => void;
  updateWindowSize: (windowId: string, size: { width: number | string; height: number | string }) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  setWallpaper: (wallpaperUrl: string) => void;
}
const initialState: DesktopState = {
  windows: [],
  notifications: [],
  activeWindowId: null,
  nextZIndex: 100,
  wallpaper: '/wallpapers/default.jpg',
};
export const useDesktopStore = create<DesktopState & DesktopActions>()(
  immer((set, get) => ({
    ...initialState,
    openApp: (appId) => {
      const appConfig = APPS.find((app) => app.id === appId);
      if (!appConfig) return;
      const existingWindow = get().windows.find((w) => w.appId === appId);
      if (existingWindow) {
        get().focusWindow(existingWindow.id);
        if (existingWindow.state === 'minimized') {
          get().setWindowState(existingWindow.id, 'normal');
        }
        return;
      }
      const newWindow: WindowInstance = {
        id: `win_${crypto.randomUUID()}`,
        appId: appConfig.id,
        title: appConfig.title,
        icon: appConfig.icon,
        position: { x: Math.random() * 200 + 50, y: Math.random() * 100 + 50 },
        size: { width: 800, height: 600 },
        zIndex: get().nextZIndex,
        state: 'normal',
      };
      set((state) => {
        state.windows.push(newWindow);
        state.activeWindowId = newWindow.id;
        state.nextZIndex += 1;
      });
    },
    closeApp: (windowId) => {
      set((state) => {
        state.windows = state.windows.filter((w) => w.id !== windowId);
        if (state.activeWindowId === windowId) {
          state.activeWindowId = state.windows.length > 0 ? state.windows[state.windows.length - 1].id : null;
        }
      });
    },
    focusWindow: (windowId) => {
      const window = get().windows.find((w) => w.id === windowId);
      if (!window || window.zIndex === get().nextZIndex - 1) {
        set({ activeWindowId: windowId });
        return;
      }
      set((state) => {
        const targetWindow = state.windows.find((w) => w.id === windowId);
        if (targetWindow) {
          targetWindow.zIndex = state.nextZIndex;
          state.nextZIndex += 1;
          state.activeWindowId = windowId;
        }
      });
    },
    setWindowState: (windowId, windowState) => {
      set((state) => {
        const window = state.windows.find((w) => w.id === windowId);
        if (window) {
          window.state = windowState;
          if (windowState !== 'minimized') {
            get().focusWindow(windowId);
          }
        }
      });
    },
    updateWindowPosition: (windowId, position) => {
      set((state) => {
        const window = state.windows.find((w) => w.id === windowId);
        if (window) {
          window.position = position;
        }
      });
    },
    updateWindowSize: (windowId, size) => {
      set((state) => {
        const window = state.windows.find((w) => w.id === windowId);
        if (window) {
          window.size = size;
        }
      });
    },
    addNotification: (notification) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${crypto.randomUUID()}`,
        timestamp: Date.now(),
      };
      set((state) => {
        state.notifications.unshift(newNotification);
        if (state.notifications.length > 20) {
          state.notifications.pop();
        }
      });
    },
    removeNotification: (notificationId) => {
      set((state) => {
        state.notifications = state.notifications.filter((n) => n.id !== notificationId);
      });
    },
    clearNotifications: () => {
      set({ notifications: [] });
    },
    setWallpaper: (wallpaperUrl) => {
      set({ wallpaper: wallpaperUrl });
    },
  }))
);