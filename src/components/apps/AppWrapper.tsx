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
class ErrorBoundaryInner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary Caught:", {
      error,
      errorInfo,
      windowId: this.props.windowId,
    });
  }
  handleClose = () => {
    useDesktopStore.getState().closeApp(this.props.windowId);
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center flex flex-col items-center justify-center h-full bg-background">
          <h2 className="text-lg font-semibold text-destructive mb-4">An error occurred in this application.</h2>
          <p className="text-sm text-muted-foreground mb-6">You can try to close this app and reopen it.</p>
          <Button onClick={this.handleClose} variant="destructive">Close App</Button>
        </div>
      );
    }
    return this.props.children;
  }
}
export const AppWrapper: React.FC<Props> = ({ children, windowId }) => {
  return <ErrorBoundaryInner windowId={windowId}>{children}</ErrorBoundaryInner>;
};
export default AppWrapper;