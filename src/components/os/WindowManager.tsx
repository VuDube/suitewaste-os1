import React, { lazy, Suspense, useEffect } from 'react';
import Window from './Window';
import { APPS } from '@/config/apps.config';
import { WindowInstance, useDesktopStore } from '@/stores/useDesktopStore';
import AppWrapper from '@/components/apps/AppWrapper';
import { Skeleton } from '@/components/ui/skeleton';
const MarketplaceLazy = lazy(() => import('@/components/apps/MarketplaceApp'));
const OperationsLazy = lazy(() => import('@/components/apps/OperationsApp'));
interface WindowManagerProps {
  windows: WindowInstance[];
}
const WindowManager: React.FC<WindowManagerProps> = ({ windows }) => {
  const focusWindow = useDesktopStore(state => state.focusWindow);
  useEffect(() => {
    let rafId: number;
    if (windows.length > 10) {
      rafId = requestAnimationFrame(() => {
        // This is a placeholder for a potential optimization.
        // For example, one could re-calculate z-indices here if they became complex.
        // For now, the existing focusWindow logic handles z-index updates efficiently.
        console.log("Performance monitoring: >10 windows open.");
      });
    }
    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [windows.length]);
  return (
    <>
      {windows.map((win) => {
        let App: React.ComponentType<any> | null = APPS.find((app) => app.id === win.appId)?.component || null;
        if (win.appId === 'marketplace') {
          App = MarketplaceLazy;
        } else if (win.appId === 'operations') {
          App = OperationsLazy;
        }
        if (!App) return null;
        return (
          <Window key={win.id} {...win}>
            <AppWrapper windowId={win.id}>
              <Suspense fallback={<Skeleton className="h-full w-full" />}>
                <App />
              </Suspense>
            </AppWrapper>
          </Window>
        );
      })}
    </>
  );
};
export default WindowManager;