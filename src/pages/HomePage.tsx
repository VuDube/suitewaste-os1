import React from 'react';
import Desktop from '@/components/os/Desktop';
import Taskbar from '@/components/os/Taskbar';
import { Toaster } from '@/components/ui/sonner';
import { useTheme } from '@/hooks/use-theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api';
export function HomePage() {
  // Initialize theme
  const { isDark, toggleTheme } = useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen bg-background font-sans flex flex-col">
        <Desktop />
        <Taskbar />
        <Toaster richColors closeButton />
      </div>
    </QueryClientProvider>
  );
}