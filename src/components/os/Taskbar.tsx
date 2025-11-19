import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartMenu from './StartMenu';
import SystemTray from './SystemTray';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import DesktopSwitcher from './DesktopSwitcher';
import { WifiOff, LogOut, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
const Taskbar: React.FC = () => {
  const i18n = (window as any).i18nInstance;
  const t = i18n ? i18n.t.bind(i18n) : (k: string) => k.split('.').pop() || k;
  const windows = useDesktopStore(state => state.windows);
  const activeWindowId = useDesktopStore(state => state.activeWindowId);
  const setWindowState = useDesktopStore(state => state.setWindowState);
  const focusWindow = useDesktopStore(state => state.focusWindow);
  const currentDesktopId = useDesktopStore(state => state.currentDesktopId);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const handleTaskbarIconClick = (winId: string, winState: 'minimized' | 'normal' | 'maximized') => {
    if (activeWindowId === winId && winState !== 'minimized') {
      setWindowState(winId, 'minimized');
    } else {
      if (winState === 'minimized') setWindowState(winId, 'normal');
      focusWindow(winId);
    }
  };
  const windowsOnCurrentDesktop = windows.filter(w => w.desktopId === currentDesktopId);
  if (!isAuthenticated) return null;
  return (
    <motion.footer
      layoutId="taskbar"
      role="navigation"
      aria-label="Taskbar"
      className="absolute bottom-0 left-0 right-0 h-14 bg-background/50 backdrop-blur-xl border-t border-border/50 z-[99999] flex items-center justify-between px-2 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)]"
    >
      <div className="flex items-center gap-2">
        <StartMenu />
        <div className="h-8 w-[1px] bg-border/50 mx-1 hidden md:block" />
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                  {user?.name?.charAt(0) || <UserIcon size={14} />}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold">{user?.name}</span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{user?.role}</span>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 mb-2" side="top" align="start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </PopoverContent>
        </Popover>
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
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleTaskbarIconClick(win.id, win.state)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-accent transition-colors relative h-10',
                    activeWindowId === win.id && win.state !== 'minimized' ? 'bg-accent shadow-inner' : ''
                  )}
                  title={t(win.title)}
                >
                  <win.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs hidden md:inline font-medium">{t(win.title)}</span>
                  {win.state !== 'minimized' && (
                    <motion.div
                      layoutId={`active_indicator_${win.id}`}
                      className={cn(
                        'absolute bottom-0 left-2 right-2 h-0.5 rounded-full',
                        activeWindowId === win.id ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-transparent'
                      )}
                    />
                  )}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <SystemTray />
    </motion.footer>
  );
};
export default Taskbar;