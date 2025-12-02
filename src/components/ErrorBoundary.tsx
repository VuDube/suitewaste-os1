import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
interface ErrorFallbackProps {
  title?: string;
  message?: string;
  error?: any;
  statusMessage?: string;
}
export function ErrorBoundary({
  title = "Something went wrong",
  message = "We're sorry, but an unexpected error occurred. Please try again.",
  error,
  statusMessage,
}: ErrorFallbackProps) {
  const refreshPage = () => {
    window.location.reload();
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4" role="alert">
      <div className="max-w-lg w-full text-center space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-16 h-16 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-destructive">{title}</h1>
          {statusMessage && <p className="text-lg text-muted-foreground">{statusMessage}</p>}
          <p className="text-muted-foreground">{message}</p>
        </div>
        {error && (
          <details className="p-4 bg-secondary rounded-lg text-left text-sm">
            <summary className="cursor-pointer font-medium">Error Details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words text-muted-foreground">
              <code>{error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}</code>
            </pre>
          </details>
        )}
        <Button onClick={refreshPage} size="lg">
          Reload Page
        </Button>
      </div>
    </div>
  );
}