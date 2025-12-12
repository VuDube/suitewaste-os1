import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Square, Minus } from 'lucide-react';
import { useDesktopStore, WindowInstance } from '@/stores/useDesktopStore';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
type WindowProps = WindowInstance & {
  children: React.ReactNode;
};
const Window: React.FC<WindowProps> = ({ id, children, ...win }) => {
  const { t } = useTranslation();
  const focusWindow = useDesktopStore((state) => state.focusWindow);
  const closeApp = useDesktopStore((state) => state.closeApp);
  const setWindowState = useDesktopStore((state) => state.setWindowState);
  const updateWindowPosition = useDesktopStore((state) => state.updateWindowPosition);
  const updateWindowSize = useDesktopStore((state) => state.updateWindowSize);
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const isMobile = useIsMobile();
  const isActive = activeWindowId === id;
  const RndGlobal = (window as any).ReactRnd;
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const dragRafId = useRef<number>();
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      if (dragRafId.current) {
        cancelAnimationFrame(dragRafId.current);
      }
    };
  }, []);
  const handleMaximizeToggle = () => {
    const newState = win.state === 'maximized' ? 'normal' : 'maximized';
    setWindowState(id, newState);
    setAnnouncement(t(newState === 'maximized' ? 'os.window.maximized' : 'os.window.restored'));
  };
  const windowVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' as const } },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' as const } },
  };
  if (win.state === 'minimized') {
    return null;
  }
  const isMaximized = win.state === 'maximized' || isMobile;
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };
  const renderContent = () => {
    const MotionWrapper = prefersReducedMotion ? 'div' : motion.div;
    const motionProps = prefersReducedMotion ? {} : {
      variants: windowVariants,
      initial: "hidden",
      animate: "visible",
      exit: "exit",
    };
    return (
      <AnimatePresence>
        <MotionWrapper
          {...motionProps}
          className={cn(
            'flex flex-col w-full h-full bg-card/80 backdrop-blur-lg shadow-2xl border transition-colors',
            isActive ? 'border-primary/50' : 'border-border/50',
            isMobile ? 'rounded-none' : 'rounded-lg'
          )}
          onMouseDownCapture={() => focusWindow(id)}
        >
          <header
            role="button"
            aria-roledescription="window drag handle"
            className={cn(
              'window-drag-handle flex items-center justify-between pl-3 pr-1 py-1 cursor-grab active:cursor-grabbing transition-colors',
              isActive ? 'bg-primary/10' : 'bg-secondary/50',
              isMobile ? 'rounded-none' : 'rounded-t-lg'
            )}
            onDoubleClick={isMobile ? undefined : handleMaximizeToggle}
          >
            <div className="flex items-center gap-2">
              <win.icon className="w-4 h-4 text-foreground/80" />
              <span className="text-sm font-medium text-foreground select-none">{t(win.title)}</span>
            </div>
            <div className="flex items-center">
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => setWindowState(id, 'minimized')} onKeyDown={(e) => handleKeyDown(e, () => setWindowState(id, 'minimized'))} aria-label={t('os.windowControls.minimize')} className="p-3 md:p-2 rounded hover:bg-muted min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto flex items-center justify-center">
                      <Minus size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>{t('os.windowControls.minimize')}</p></TooltipContent>
                </Tooltip>
                {!isMobile && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleMaximizeToggle} onKeyDown={(e) => handleKeyDown(e, handleMaximizeToggle)} aria-label={win.state === 'maximized' ? t('os.windowControls.restore') : t('os.windowControls.maximize')} className="p-3 md:p-2 rounded hover:bg-muted min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto flex items-center justify-center">
                        {win.state === 'maximized' ? <Minimize2 size={14} /> : <Square size={14} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p>{win.state === 'maximized' ? t('os.windowControls.restore') : t('os.windowControls.maximize')}</p></TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => closeApp(id)} onKeyDown={(e) => handleKeyDown(e, () => closeApp(id))} aria-label={t('os.windowControls.close')} className="p-3 md:p-2 rounded hover:bg-destructive/80 hover:text-destructive-foreground min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto flex items-center justify-center">
                      <X size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>{t('os.windowControls.close')}</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>
          <div aria-live="polite" className="sr-only">{announcement}</div>
          <div className="flex-1 overflow-hidden bg-background/50">
            {children}
          </div>
        </MotionWrapper>
      </AnimatePresence>
    );
  };
  if (RndGlobal) {
    return (
      <RndGlobal
        size={isMaximized ? { width: '100%', height: '100%' } : win.size}
        position={isMaximized ? { x: 0, y: 0 } : win.position}
        onDragStart={() => focusWindow(id)}
        onDragStop={(_e: any, d: any) => {
          if (dragRafId.current) cancelAnimationFrame(dragRafId.current);
          dragRafId.current = requestAnimationFrame(() => {
            updateWindowPosition(id, { x: d.x, y: d.y });
          });
        }}
        onResizeStart={() => focusWindow(id)}
        onResizeStop={(_e: any, _dir: any, ref: any, _delta: any, pos: any) => {
          updateWindowSize(id, { width: ref.style.width, height: ref.style.height });
          updateWindowPosition(id, { x: pos.x, y: pos.y });
        }}
        minWidth={300}
        minHeight={200}
        dragHandleClassName="window-drag-handle"
        bounds="parent"
        style={{ zIndex: win.zIndex }}
        disableDragging={isMaximized}
        enableResizing={!isMaximized}
        className={cn('flex window-print-container', isMobile ? '!w-full !h-full !transform-none' : '')}
      >
        {renderContent()}
      </RndGlobal>
    );
  }
  // Fallback for when react-rnd fails to load
  return (
    <div
      style={{
        zIndex: win.zIndex,
        width: isMaximized ? '100%' : win.size.width,
        height: isMaximized ? '100%' : win.size.height,
        top: isMaximized ? 0 : win.position.y,
        left: isMaximized ? 0 : win.position.x,
        resize: isMaximized ? 'none' : 'both',
        overflow: 'auto',
        cursor: isMaximized ? 'default' : 'auto',
        minWidth: '300px',
        minHeight: '200px',
      }}
      className={cn('flex absolute window-print-container', isMobile ? '!w-full !h-full !transform-none' : '')}
    >
      {renderContent()}
    </div>
  );
};
export default Window;