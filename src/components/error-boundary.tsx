import React from 'react';
import ErrorPage from '@/pages/ErrorPage';
import { debugError, isVerboseLogging } from '@/config/debug';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging for debugging
    debugError('Error caught by ErrorBoundary:', {
      error: error.message,
      stack: error.stack,
      errorInfo,
      timestamp: new Date().toISOString()
    });
    
    // Log to console for development
    if (isVerboseLogging()) {
      console.group('🔴 ErrorBoundary - Component Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  reset = () => {
    debugError('ErrorBoundary reset triggered');
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorPage error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
