import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartMenu from './StartMenu';
import SystemTray from './SystemTray';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import DesktopSwitcher from './DesktopSwitcher';
const Taskbar: React.FC = () => {
  const { windows, activeWindowId, setWindowState, focusWindow, currentDesktopId } = useDesktopStore(
    useShallow((state) => ({
      windows: state.windows,
      activeWindowId: state.activeWindowId,
      setWindowState: state.setWindowState,
      focusWindow: state.focusWindow,
      currentDesktopId: state.currentDesktopId,
    }))
  );
  const handleTaskbarIconClick = (winId: string, winState: 'minimized' | 'normal' | 'maximized') => {
    if (activeWindowId === winId && winState !== 'minimized') {
      setWindowState(winId, 'minimized');
    } else {
      if (winState === 'minimized') {
        setWindowState(winId, 'normal');
      }
      focusWindow(winId);
    }
  };
  const windowsOnCurrentDesktop = windows.filter(w => w.desktopId === currentDesktopId);
  return (
    <motion.footer
      layoutId="taskbar"
      role="navigation"
      aria-label="Taskbar"
      className="absolute bottom-0 left-0 right-0 h-12 bg-background/50 backdrop-blur-xl border-t border-border/50 z-[99999] flex items-center justify-between px-2"
    >
      <div className="flex items-center gap-2">
        <StartMenu />
      </div>
      <div className="flex items-center gap-2">
        <DesktopSwitcher />
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {windowsOnCurrentDesktop.map((win) => (
              <motion.button
                key={win.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                onClick={() => handleTaskbarIconClick(win.id, win.state)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors relative',
                  activeWindowId === win.id && win.state !== 'minimized' ? 'bg-accent' : ''
                )}
                title={win.title}
                aria-pressed={activeWindowId === win.id && win.state !== 'minimized'}
              >
                <win.icon className="w-5 h-5" />
                <span className="text-sm hidden md:inline">{win.title}</span>
                {win.state !== 'minimized' && (
                  <motion.div
                    layoutId={`active_indicator_${win.id}`}
                    className={cn(
                      'absolute bottom-0 left-2 right-2 h-0.5 rounded-full',
                      activeWindowId === win.id ? 'bg-primary' : 'bg-transparent'
                    )}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <SystemTray />
    </motion.footer>
  );
};
export default Taskbar;