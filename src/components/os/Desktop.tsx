import React from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import WindowManager from './WindowManager';
const Desktop: React.FC = () => {
  const wallpaper = useDesktopStore((state) => state.wallpaper);
  return (
    <main
      className="flex-1 h-full w-full relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      <WindowManager />
    </main>
  );
};
export default Desktop;