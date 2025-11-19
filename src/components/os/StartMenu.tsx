import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { APPS } from '@/config/apps.config';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';
const StartMenu: React.FC = () => {
  const openApp = useDesktopStore((state) => state.openApp);
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50">
          <Leaf className="w-6 h-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mb-2 p-2" side="top" align="start">
        <div className="grid grid-cols-4 gap-2">
          {APPS.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => {
                  openApp(app.id);
                  setIsOpen(false);
                }}
                className="flex flex-col items-center justify-center gap-2 p-2 rounded-md hover:bg-accent w-full aspect-square transition-colors"
              >
                <app.icon className="w-8 h-8 text-primary" />
                <span className="text-xs text-center text-foreground truncate w-full">{app.title}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default StartMenu;