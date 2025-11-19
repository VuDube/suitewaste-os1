import React from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import Window from './Window';
import { APPS } from '@/config/apps.config';
const WindowManager: React.FC = () => {
  const windows = useDesktopStore(useShallow((state) => state.windows));
  return (
    <>
      {windows.map((win) => {
        const App = APPS.find((app) => app.id === win.appId)?.component;
        if (!App) return null;
        return (
          <Window key={win.id} {...win}>
            <App />
          </Window>
        );
      })}
    </>
  );
};
export default WindowManager;