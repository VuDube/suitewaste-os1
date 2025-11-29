import React from 'react';
import { errorReporter } from '@/lib/errorReporter';
import { Button } from '@/components/ui/button';
interface State {
  hasError: boolean;
}
interface Props {
  children: React.ReactNode;
}
class AppErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(): State {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    errorReporter.report({
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      error: error,
      level: "error",
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center flex flex-col items-center justify-center h-full">
          <h2 className="text-lg font-semibold text-destructive mb-4">Something went wrong in this app.</h2>
          <Button onClick={() => this.setState({ hasError: false })}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default AppErrorBoundary;