import { useEffect } from 'react';
import { create } from 'zustand';
import { DeviceManager, DeviceInfo } from '@/lib/hardware';
import { useDesktopStore } from '@/stores/useDesktopStore';
interface HardwareState {
  devices: Map<string, DeviceInfo>;
  status: 'idle' | 'scanning' | 'ready';
  manager: DeviceManager | null;
  init: () => void;
  queueAction: (action: { type: string; data: any }) => void;
}
const useHardwareStore = create<HardwareState>((set, get) => ({
  devices: new Map(),
  status: 'idle',
  manager: null,
  init: () => {
    if (get().manager) return;
    const manager = new DeviceManager();
    set({ manager, status: 'scanning' });
    manager.on('device', (device: DeviceInfo) => {
      set(state => {
        const newDevices = new Map(state.devices);
        newDevices.set(device.id, device);
        useDesktopStore.getState().updateHardwareState(newDevices);
        return { devices: newDevices };
      });
    });
    manager.on('gps', (pos: { lat: number; lng: number }) => {
      useDesktopStore.getState().updateAppState('operations', { gps: pos });
    });
    manager.on('error', (errorCode: string) => {
      useDesktopStore.getState().notifyHardwareEvent(errorCode, 'system');
    });
    manager.on('info', (infoCode: string) => {
      useDesktopStore.getState().notifyHardwareEvent(infoCode, 'system');
    });
    manager.detectDevices().finally(() => set({ status: 'ready' }));
  },
  queueAction: (action) => {
    get().manager?.queueAction(action);
  },
}));
export const useHardwareManager = () => {
  const { devices, status, queueAction, init } = useHardwareStore();
  useEffect(() => {
    init();
  }, [init]);
  const isConnected = (id: string) => devices.get(id)?.status === 'connected';
  return { devices, status, queueAction, isConnected };
};