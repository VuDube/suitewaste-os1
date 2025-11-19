import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { queryClient } from '@/lib/api';
interface Props {
  children: React.ReactNode;
  windowId: string;
}
interface State {
  hasError: boolean;
  error: Error | null;
}
class ErrorBoundaryInner extends React.Component<
  { children: React.ReactNode; onError: (error: Error, info: React.ErrorInfo) => void },
  unknown
> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Delegate handling/logging to the functional wrapper via callback
    try {
      this.props.onError?.(error, errorInfo);
    } catch (e) {
      // Ensure no further exceptions escape the boundary
      // eslint-disable-next-line no-console
      console.error('Error while calling onError callback of ErrorBoundaryInner', e);
    }
  }

  render() {
    return this.props.children;
  }
}

export const AppWrapper: React.FC<Props> = ({ children, windowId }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use effect for logging/reporting when an error occurs
  useEffect(() => {
    if (hasError && error) {
      // Log the error with context (windowId and timestamp)
      // This mirrors previous console.error behavior but kept inside hook per requirement
      console.error('App Error Boundary Caught:', {
        error,
        windowId,
        timestamp: Date.now(),
      });
    }
  }, [hasError, error, windowId]);

  const onError = (err: Error, info: React.ErrorInfo) => {
    setHasError(true);
    setError(err);
    // Additional side-effects (reporting) are done in the useEffect above
  };

  const handleClose = () => {
    // Call the store action from the functional component (hooks-safe)
    useDesktopStore.getState().closeApp(windowId);
    // Reset local error state after initiating close to avoid stale UI
    setHasError(false);
    setError(null);
  };

  if (hasError) {
    return (
      <div className="p-4 text-center flex flex-col items-center justify-center h-full bg-background">
        <h2 className="text-lg font-semibold text-destructive mb-4">An error occurred in this application.</h2>
        <p className="text-sm text-muted-foreground mb-6">You can try to close this app and reopen it.</p>
        <Button onClick={handleClose} variant="destructive">Close App</Button>
      </div>
    );
  }

  return <ErrorBoundaryInner onError={onError}>{children}</ErrorBoundaryInner>;
};
export default AppWrapper;