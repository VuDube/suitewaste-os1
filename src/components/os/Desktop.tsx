import React from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import WindowManager from './WindowManager';
import { useShallow } from 'zustand/react/shallow';
const Desktop: React.FC = () => {
  const { wallpaper, windows, currentDesktopId } = useDesktopStore(
    useShallow((state) => ({
      wallpaper: state.wallpaper,
      windows: state.windows,
      currentDesktopId: state.currentDesktopId,
    }))
  );
  const visibleWindows = windows.filter((w) => w.desktopId === currentDesktopId);
  return (
    <main
      className="flex-1 h-full w-full relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <WindowManager windows={visibleWindows} />
    </main>
  );
};
export default Desktop;