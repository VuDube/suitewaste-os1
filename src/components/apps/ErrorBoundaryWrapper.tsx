import React from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { Button } from '@/components/ui/button';
interface State {
  hasError: boolean;
}
interface Props {
  children: React.ReactNode;
}

const AppErrorBoundary: React.FC<Props> = ({ children }) => {
  const [errorState, setErrorState] = React.useState<{
    hasError: boolean;
    error?: Error | null;
    info?: React.ErrorInfo | null;
  }>({ hasError: false, error: null, info: null });

  // Report to errorReporter whenever an error is captured
  React.useEffect(() => {
    if (errorState.hasError && errorState.error) {
      errorReporter.report({
        message: errorState.error.message,
        stack: errorState.error.stack,
        componentStack: errorState.info?.componentStack,
        errorBoundary: true,
        error: errorState.error,
        level: 'error',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        timestamp: new Date().toISOString(),
      });
    }
  }, [errorState.hasError, errorState.error, errorState.info]);

  // Inner class-based boundary to leverage componentDidCatch lifecycle
  const Boundary = React.useMemo(() => {
    return class Boundary extends React.Component<
      { children: React.ReactNode; onError: (err: Error, info: React.ErrorInfo) => void }
    > {
      componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        if (this.props.onError) {
          this.props.onError(error, errorInfo);
        }
      }
      render() {
        return this.props.children as React.ReactElement;
      }
    };
  }, []);

  if (errorState.hasError) {
    return (
      <div className="p-4 text-center flex flex-col items-center justify-center h-full">
        <h2 className="text-lg font-semibold text-destructive mb-4">Something went wrong in this app.</h2>
        <Button onClick={() => setErrorState({ hasError: false, error: null, info: null })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Boundary onError={(error, info) => setErrorState({ hasError: true, error, info })}>
      {children}
    </Boundary>
  );
};

export default AppErrorBoundary;