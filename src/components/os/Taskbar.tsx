import React from 'react';
import { motion } from 'framer-motion';
import StartMenu from './StartMenu';
import SystemTray from './SystemTray';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';interface AnimatePresence {id?: string | number;
  [key: string]: unknown;
}interface AnimatePresenceProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}const Taskbar: React.FC = () => {const { windows, activeWindowId, setWindowState, focusWindow } = useDesktopStore(
    useShallow((state) => ({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      setWindowState: state.setWindowState,
      focusWindow: state.focusWindow
    }))
  );
  const handleTaskbarIconClick = (winId: string, winState: 'minimized' | 'normal' | 'maximized') => {
    if (activeWindowId === winId && winState !== 'minimized') {
      setWindowState(winId, 'minimized');
    } else {
      setWindowState(winId, 'normal');
      focusWindow(winId);
    }
  };
  return (
    <footer className="absolute bottom-0 left-0 right-0 h-12 bg-background/50 backdrop-blur-xl border-t border-border/50 z-[99999] flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <StartMenu />
        {windows.map((win) =>
        <motion.button
          key={win.id}
          layout
          onClick={() => handleTaskbarIconClick(win.id, win.state)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors relative',
            activeWindowId === win.id && win.state !== 'minimized' ? 'bg-accent' : ''
          )}
          title={win.title}>

            <win.icon className="w-5 h-5" />
            <span className="text-sm hidden md:inline">{win.title}</span>
            <AnimatePresence>
              {win.state !== 'minimized' &&
            <motion.div
              layoutId={`active_indicator_${win.id}`}
              className={cn(
                'absolute bottom-0 left-2 right-2 h-0.5 rounded-full',
                activeWindowId === win.id ? 'bg-primary' : 'bg-transparent'
              )} />

            }
            </AnimatePresence>
          </motion.button>
        )}
      </div>
      <SystemTray />
    </footer>);

};
export default Taskbar;