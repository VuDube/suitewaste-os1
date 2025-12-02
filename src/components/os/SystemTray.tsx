import React, { useState, useEffect } from 'react';
import { Bell, Printer, Camera, Satellite, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import NotificationCenter from './NotificationCenter';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareManager } from '@/hooks/useHardwareManager';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  // All hooks are called unconditionally at the top level.
  const [time, setTime] = useState(new Date());
  const { t } = useTranslation();
  const notifications = useDesktopStore(useShallow((state) => state.notifications));
  // Guard against useHardwareManager returning null during initialization or in non-browser environments.
  const hardwareManager = useHardwareManager();
  const devices = hardwareManager?.devices || new Map();
  const status = hardwareManager?.status || 'idle';
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 60); // Update every minute
    return () => clearInterval(timer);
  }, []);
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' });
  return (
    <div className="flex items-center gap-2 pr-2">
      <div className="flex items-center gap-2">
        {status === 'scanning' && <Loader2 className="h-4 w-4 animate-spin" />}
        <TooltipProvider>
          {devices.size > 0 && Array.from(devices.values()).map(d => (
            <Tooltip key={d.id}>
              <TooltipTrigger asChild>
                <button className="p-1 rounded hover:bg-accent" aria-label={t('hardware.status', { type: d.type, status: d.status })}>
                  <HardwareIcon type={d.type} className={cn('w-4 h-4', d.status === 'error' ? 'text-destructive' : 'text-muted-foreground')} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{d.type.toUpperCase()}: {d.status}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
      <div className="text-xs text-right text-foreground">
        <div>{formattedTime}</div>
        <div className="text-muted-foreground">{formattedDate}</div>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button className="relative p-2 rounded-md hover:bg-accent">
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
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