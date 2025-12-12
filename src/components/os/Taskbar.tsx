import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartMenu from './StartMenu';
import SystemTray from './SystemTray';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '@/lib/utils';
import DesktopSwitcher from './DesktopSwitcher';
import { WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
const useOfflineStatus = (t: (key: string) => string) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast.success(t('hardware.onlineStatus'));
  }, [t]);
  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast.warning(t('hardware.offlineStatus'));
  }, [t]);
  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);
  return isOnline;
};
const Taskbar: React.FC = () => {
  const i18n = (window as any).i18nInstance;
  const t = i18n ? i18n.t.bind(i18n) : (k: string) => k.split('.').pop() || k;
  const windows = useDesktopStore(state => state.windows);
  const activeWindowId = useDesktopStore(state => state.activeWindowId);
  const setWindowState = useDesktopStore(state => state.setWindowState);
  const focusWindow = useDesktopStore(state => state.focusWindow);
  const currentDesktopId = useDesktopStore(state => state.currentDesktopId);
  const isOnline = useOfflineStatus(t);
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
      className="absolute bottom-0 left-0 right-0 h-14 bg-background/50 backdrop-blur-xl border-t border-border/50 z-[99999] flex items-center justify-between px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]"
    >
      <div className="flex items-center gap-2">
        <StartMenu />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2">
          <DesktopSwitcher />
          <div className="flex items-center gap-1 flex-wrap">
            <AnimatePresence mode="wait">
              {windowsOnCurrentDesktop.map((win) => (
                <motion.button
                  key={win.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTaskbarIconClick(win.id, win.state)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors relative min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto',
                    activeWindowId === win.id && win.state !== 'minimized' ? 'bg-accent' : ''
                  )}
                  title={t(win.title)}
                  aria-pressed={activeWindowId === win.id && win.state !== 'minimized'}
                >
                  <win.icon className="w-5 h-5" />
                  <span className="text-sm hidden md:inline">{t(win.title)}</span>
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
      </div>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge variant="destructive" aria-live="polite" aria-label={t('hardware.offline')} className="ml-2 hidden md:flex items-center gap-1 min-h-[44px] min-w-auto md:min-h-auto">
              <WifiOff size={14} /> {t('hardware.offline')}
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
      <SystemTray />
    </motion.footer>
  );
};
export default Taskbar;