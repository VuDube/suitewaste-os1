import React from 'react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minimize2, Square, Minus } from 'lucide-react';
import { useDesktopStore, WindowInstance } from '@/stores/useDesktopStore';
import { cn } from '@/lib/utils';
type WindowProps = WindowInstance & {
  children: React.ReactNode;
};
const Window: React.FC<WindowProps> = ({ id, children, ...win }) => {
  const {
    focusWindow,
    closeApp,
    setWindowState,
    updateWindowPosition,
    updateWindowSize,
  } = useDesktopStore((state) => ({
    focusWindow: state.focusWindow,
    closeApp: state.closeApp,
    setWindowState: state.setWindowState,
    updateWindowPosition: state.updateWindowPosition,
    updateWindowSize: state.updateWindowSize,
  }));
  const activeWindowId = useDesktopStore((state) => state.activeWindowId);
  const isActive = activeWindowId === id;
  const handleMaximizeToggle = () => {
    setWindowState(id, win.state === 'maximized' ? 'normal' : 'maximized');
  };
  const windowVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } },
  };
  if (win.state === 'minimized') {
    return null;
  }
  return (
    <Rnd
      size={win.state === 'maximized' ? { width: '100%', height: '100%' } : win.size}
      position={win.state === 'maximized' ? { x: 0, y: 0 } : win.position}
      onDragStart={() => focusWindow(id)}
      onDragStop={(_e, d) => updateWindowPosition(id, { x: d.x, y: d.y })}
      onResizeStart={() => focusWindow(id)}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        updateWindowSize(id, { width: ref.style.width, height: ref.style.height });
        updateWindowPosition(id, { x: pos.x, y: pos.y });
      }}
      minWidth={300}
      minHeight={200}
      dragHandleClassName="window-drag-handle"
      bounds="parent"
      style={{ zIndex: win.zIndex }}
      disableDragging={win.state === 'maximized'}
      enableResizing={win.state !== 'maximized'}
      className="flex"
    >
      <AnimatePresence>
        <motion.div
          variants={windowVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            'flex flex-col w-full h-full bg-card/80 backdrop-blur-lg rounded-lg shadow-2xl border transition-colors',
            isActive ? 'border-primary/50' : 'border-border/50'
          )}
          onMouseDownCapture={() => focusWindow(id)}
        >
          <header
            className={cn(
              'window-drag-handle flex items-center justify-between pl-3 pr-1 py-1 rounded-t-lg cursor-grab active:cursor-grabbing transition-colors',
              isActive ? 'bg-primary/10' : 'bg-secondary/50'
            )}
            onDoubleClick={handleMaximizeToggle}
          >
            <div className="flex items-center gap-2">
              <win.icon className="w-4 h-4 text-foreground/80" />
              <span className="text-sm font-medium text-foreground select-none">{win.title}</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setWindowState(id, 'minimized')}
                className="p-2 rounded hover:bg-muted"
              >
                <Minus size={14} />
              </button>
              <button onClick={handleMaximizeToggle} className="p-2 rounded hover:bg-muted">
                {win.state === 'maximized' ? <Minimize2 size={14} /> : <Square size={14} />}
              </button>
              <button onClick={() => closeApp(id)} className="p-2 rounded hover:bg-destructive/80 hover:text-destructive-foreground">
                <X size={14} />
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-hidden bg-background/50">
            {children}
          </div>
        </motion.div>
      </AnimatePresence>
    </Rnd>
  );
};
export default Window;