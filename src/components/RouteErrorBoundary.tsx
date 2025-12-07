import React, { useEffect } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { errorReporter } from '@/lib/errorReporter';
import { ErrorBoundary as ErrorFallback } from '@/components/ErrorBoundary';
export function RouteErrorBoundary() {
  // Call the hook unconditionally at the top level of the component.
  // This component is designed to be used only in the `errorElement` prop
  // of a route, where `useRouteError` is guaranteed to have a value.
  const error = useRouteError();
  useEffect(() => {
    if (error) {
      let errorMessage = 'Unknown route error';
      let errorStack = '';
      if (isRouteErrorResponse(error)) {
        errorMessage = `Route Error ${error.status}: ${error.statusText}`;
        if (error.data) {
          errorMessage += ` - ${JSON.stringify(error.data)}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorStack = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = JSON.stringify(error);
      }
      errorReporter.report({
        message: errorMessage,
        stack: errorStack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        source: 'react-router',
        error: error,
        level: "error",
      });
    }
  }, [error]);
  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        title={`${error.status} ${error.statusText}`}
        message="Sorry, an error occurred while loading this page."
        error={error.data ? { message: JSON.stringify(error.data, null, 2) } : error}
        statusMessage="Navigation error detected"
      />
    );
  }
  return (
    <ErrorFallback
      title="Unexpected Error"
      message="An unexpected error occurred while loading this page."
      error={error}
      statusMessage="Routing error detected"
    />
  );
}