import { useEffect, useCallback } from 'react';
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
        // Directly call the store's action
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
  const devices = useHardwareStore((state) => state.devices);
  const status = useHardwareStore((state) => state.status);
  const queueAction = useHardwareStore((state) => state.queueAction);
  const init = useHardwareStore((state) => state.init);
  useEffect(() => {
    init();
  }, [init]);
  const isConnected = useCallback(
    (id: string) => devices.get(id)?.status === 'connected',
    [devices]
  );
  return { devices, status, queueAction, isConnected };
};