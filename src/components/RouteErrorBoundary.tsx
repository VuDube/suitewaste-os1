/**
 * RouteErrorBoundary.tsx
 *
 * Ensures useRouteError() is called unconditionally at the top-level of the component
 * to satisfy react-hooks/rules-of-hooks. Preserves existing behavior:
 *  - uses useEffect to report errors via errorReporter
 *  - preserves isRouteErrorResponse handling and ErrorFallback rendering
 *
 * Note: Imports are kept consistent with the surrounding codebase.
 */
import React, { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import ErrorFallback from "./ErrorBoundary";
import { errorReporter } from "@/lib/errorReporter";
/**
 * RouteErrorBoundary
 *
 * This component is used as the errorElement in react-router route definitions.
 * To comply with the lint rule react-hooks/rules-of-hooks we call useRouteError()
 * unconditionally at the top of the component and then preserve the previous
 * effect/reporting/rendering behavior.
 */
export default function RouteErrorBoundary(): JSX.Element {
  // Call the hook unconditionally (fixes rules-of-hooks warnings)
  const routeError = useRouteError();
  // Maintain a local `error` variable initialized from the hook result,
  // as requested by the change requirements.
  let error: unknown = routeError;
  useEffect(() => {
    // Preserve previous reporting behavior: attempt to report route errors,
    // route error responses, and fallback to stringification for unexpected shapes.
    try {
      if (isRouteErrorResponse(error)) {
        // route error responses often include useful metadata (status, data)
        errorReporter.report(error);
        return;
      }
      if (error instanceof Error) {
        errorReporter.report(error);
        return;
      }
      // For non-Error, non-RouteErrorResponse values, coerce to an Error for reporting.
      errorReporter.report(new Error(String(error)));
    } catch (reportErr) {
      // Intentionally swallow any reporting errors to avoid further rendering issues.
      // Keep behavior identical to previous implementation (no side-effects beyond reporting).
      // eslint-disable-next-line no-console
      console.debug("RouteErrorBoundary: error reporting failed", reportErr);
    }
  }, [error]);
  // Preserve original rendering logic for route errors vs normal errors.
  if (isRouteErrorResponse(error)) {
    // Keep exact handling for RouteErrorResponse.
    // Pass through the original error object so ErrorFallback can render status/details.
    return <ErrorFallback error={error} />;
  }
  // For other error shapes, surface them to the fallback as-is.
  return <ErrorFallback error={error} />;
}