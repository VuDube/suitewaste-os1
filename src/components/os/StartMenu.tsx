import React, { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { APPS } from '@/config/apps.config';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
const StartMenu: React.FC = () => {
  const i18n = (window as any).i18nInstance;
  const t = i18n ? i18n.t.bind(i18n) : (k: string, opts?: any) => (opts?.defaultValue !== undefined ? opts.defaultValue : k.split('.').pop() || k);
  const openApp = useDesktopStore((state) => state.openApp);
  const [isOpen, setIsOpen] = React.useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const AppButton = ({ app, index }: { app: typeof APPS[0], index: number }) => {
    const buttonContent = (
      <button
        onClick={() => {
          openApp(app.id, { title: app.title, icon: app.icon });
          setIsOpen(false);
        }}
        className="flex flex-col items-center justify-center gap-2 p-3 md:p-2 rounded-md hover:bg-accent w-full aspect-square transition-colors min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto"
        aria-expanded="false"
      >
        <app.icon className="w-8 h-8 text-primary" />
        <span className="text-xs text-center text-foreground truncate w-full">{t(app.title)}</span>
      </button>
    );
    const motionWrapper = (
      <motion.div
        key={app.id}
        variants={itemVariants}
      >
        {buttonContent}
      </motion.div>
    );
    const staticWrapper = (
      <div key={app.id}>
        {buttonContent}
      </div>
    );
    return (
      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger asChild>
            {prefersReducedMotion ? staticWrapper : motionWrapper}
          </TooltipTrigger>
          <TooltipContent>
            <p>{t(app.title)}</p>
            {t(`${app.id}.description`, { ns: 'apps', defaultValue: '' }) && (
              <p className="text-xs text-muted-foreground">{t(`${app.id}.description`, { ns: 'apps' })}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 min-h-[44px] min-w-[44px] md:min-h-auto md:min-w-auto">
          <Leaf className="w-6 h-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mb-2 p-2" side="top" align="start">
        <motion.div
          className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {APPS.map((app, index) => (
            <AppButton key={app.id} app={app} index={index} />
          ))}
        </motion.div>
      </PopoverContent>
    </Popover>
  );
};
export default StartMenu;