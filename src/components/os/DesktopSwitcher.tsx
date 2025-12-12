import React, { useState, useEffect } from 'react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSwipeable } from 'react-swipeable';
const DesktopSwitcher: React.FC = () => {
  const i18n = (window as any).i18nInstance;
  const t = i18n ? i18n.t.bind(i18n) : (k: string) => k.split('.').pop() || k;
  const desktops = useDesktopStore(state => state.desktops);
  const currentDesktopId = useDesktopStore(state => state.currentDesktopId);
  const setCurrentDesktop = useDesktopStore(state => state.setCurrentDesktop);
  const addDesktop = useDesktopStore(state => state.addDesktop);
  const removeDesktop = useDesktopStore(state => state.removeDesktop);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const getNextDesktopId = () => {
    const currentIndex = desktops.findIndex(d => d.id === currentDesktopId);
    if (currentIndex === -1 || desktops.length <= 1) return null;
    return desktops[(currentIndex + 1) % desktops.length].id;
  };
  const getPrevDesktopId = () => {
    const currentIndex = desktops.findIndex(d => d.id === currentDesktopId);
    if (currentIndex === -1 || desktops.length <= 1) return null;
    return desktops[(currentIndex - 1 + desktops.length) % desktops.length].id;
  };
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      const nextId = getNextDesktopId();
      if (nextId) setCurrentDesktop(nextId);
    },
    onSwipedRight: () => {
      const prevId = getPrevDesktopId();
      if (prevId) setCurrentDesktop(prevId);
    },
    delta: 50,
    preventScrollOnSwipe: true,
    trackMouse: true,
  });
  const renderDesktopButton = (desktop: typeof desktops[0]) => (
    <div className="relative group">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentDesktop(desktop.id)}
        className={cn(
          'px-3 transition-all duration-200 min-h-[44px] min-w-[48px] md:min-h-auto md:min-w-auto',
          currentDesktopId === desktop.id ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50'
        )}
      >
        {t(desktop.name)}
      </Button>
      {desktops.length > 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive/80 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
          onClick={(e) => {
            e.stopPropagation();
            removeDesktop(desktop.id);
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
  return (
    <div {...handlers} className="flex items-center gap-1 bg-secondary p-1 rounded-md flex-wrap touch-pan-y" aria-live="polite">
      {prefersReducedMotion ? (
        desktops.map((desktop) => (
          <div key={desktop.id} className="relative group">
            {renderDesktopButton(desktop)}
          </div>
        ))
      ) : (
        <AnimatePresence>
          {desktops.map((desktop) => (
            <motion.div
              key={desktop.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="relative group"
            >
              {renderDesktopButton(desktop)}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      <Button variant="ghost" size="icon" className="h-8 w-8 min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto" onClick={addDesktop}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
};
export default DesktopSwitcher;