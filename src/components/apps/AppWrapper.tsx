import React from 'react';
import AppErrorBoundary from './ErrorBoundaryWrapper';
interface Props {
  children: React.ReactNode;
}
export const AppWrapper: React.FC<Props> = ({ children }) => <AppErrorBoundary>{children}</AppErrorBoundary>;
export default AppWrapper;