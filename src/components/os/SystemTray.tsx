import React, { useState, useEffect } from 'react';
import { Bell, Printer, Camera, Satellite, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import NotificationCenter from './NotificationCenter';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareManager } from '@/hooks/useHardwareManager';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
const HardwareIcon = ({ type, className }: { type: string, className?: string }) => {
  switch (type) {
    case 'printer':
    case 'usb':
      return <Printer className={className} />;
    case 'camera':
      return <Camera className={className} />;
    case 'gps':
      return <Satellite className={className} />;
    default:
      return null;
  }
};
const SystemTray: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const notifications = useDesktopStore(useShallow((state) => state.notifications));
  const hardwareManager = useHardwareManager();
  const devices = hardwareManager?.devices || new Map();
  const status = hardwareManager?.status || 'idle';
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
  const renderHardwareIcons = () => {
    const icons = Array.from(devices.values()).map(d => (
      <Tooltip key={d.id}>
        <TooltipTrigger asChild>
          <button className="p-1 rounded hover:bg-accent min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto" aria-label={`${d.type} status: ${d.status}`}>
            <HardwareIcon type={d.type} className={cn('w-4 h-4', d.status === 'error' ? 'text-destructive' : 'text-muted-foreground')} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-semibold">{d.type.toUpperCase()}</p>
          <p>Status: {d.status}</p>
          {d.battery && <p>Battery: {d.battery}%</p>}
          <p className="text-xs text-muted-foreground">
            Connected {formatDistanceToNow(d.connectedAt, { addSuffix: true })}
          </p>
        </TooltipContent>
      </Tooltip>
    ));
    if (prefersReducedMotion) {
      return <>{icons}</>;
    }
    return <AnimatePresence>{icons.map(icon => (
      <motion.div
        key={icon.key}
        layout
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {icon}
      </motion.div>
    ))}</AnimatePresence>;
  };
  return (
    <div role="region" aria-labelledby="system-tray-label" className="flex items-center gap-2 pr-2">
      <span id="system-tray-label" className="sr-only">System Tray</span>
      <div className="flex items-center gap-2">
        {status === 'scanning' && <Loader2 className="h-4 w-4 animate-spin" />}
        <TooltipProvider>
          <Sheet>
            <SheetTrigger asChild>
              <div className="flex items-center gap-1" aria-expanded="false">
                {renderHardwareIcons()}
              </div>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Hardware Details</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                {Array.from(devices.values()).map(d => (
                  <div key={d.id} className="mb-2">
                    <p className="font-semibold">{d.type.toUpperCase()}</p>
                    <p>Status: {d.status}</p>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </TooltipProvider>
      </div>
      <div className="text-xs text-right text-foreground">
        <div>{formattedTime}</div>
        <div className="text-muted-foreground">{formattedDate}</div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative p-2 rounded-md hover:bg-accent min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto" aria-label="Open notifications">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3" aria-live="polite">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 justify-center items-center text-[10px] text-white">
                  {notifications.length}
                </span>
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 mb-2 p-0" side="top" align="end">
          <NotificationCenter />
        </PopoverContent>
      </Popover>
    </div>
  );
};
export default SystemTray;