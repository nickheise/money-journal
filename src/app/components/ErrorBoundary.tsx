import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents entire app crash when a component throws an error
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Store error info for display
    this.setState({ errorInfo });
    
    // In production, you could send to error tracking service
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/30 flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl p-8 max-w-md w-full border border-border">
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              
              {/* Error Message */}
              <h2 className="mb-2">Oops! Something went wrong</h2>
              
              <p className="text-sm text-muted-foreground mb-6">
                Don't worry, your data is safe. Try refreshing the page.
              </p>
              
              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-6 bg-secondary p-4 rounded-xl">
                  <summary className="text-sm font-medium cursor-pointer mb-2 text-destructive">
                    Error Details (dev only)
                  </summary>
                  <div className="space-y-2">
                    <pre className="text-xs bg-destructive/10 p-3 rounded-lg overflow-auto whitespace-pre-wrap">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-xs bg-destructive/10 p-3 rounded-lg overflow-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReload}
                  className="w-full h-12 gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Page
                </Button>

                {/* Return Home Option */}
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="w-full h-12 gap-2"
                >
                  <Home className="w-5 h-5" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Lightweight error boundary for inline use
 * Shows a simple fallback message without full-page takeover
 */
export const InlineErrorBoundary: React.FC<ErrorBoundaryProps & { fallbackMessage?: string }> = ({
  children,
  fallbackMessage = 'Something went wrong loading this section',
  onReset,
}) => {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">{fallbackMessage}</p>
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      }
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
};