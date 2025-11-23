import React from 'react';
import Desktop from '@/components/os/Desktop';
import Taskbar from '@/components/os/Taskbar';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
export function HomePage() {
  // Initialize theme
  useTheme();
  return (
    <div className="h-screen w-screen bg-background font-sans flex flex-col">
      <Desktop />

      {/* Accessible, non-intrusive AI quota notice placed above the Taskbar */}
      <div className="fixed bottom-14 left-0 w-full flex justify-center z-40 px-4 pointer-events-none">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-auto bg-white/90 dark:bg-slate-900/90 text-sm text-muted-foreground px-3 py-2 rounded-md shadow-md"
        >
          Note: AI features have a limited request quota across all apps and may be rate-limited.
        </div>
      </div>

      <Taskbar />
      <Toaster richColors closeButton />
    </div>
  );
}