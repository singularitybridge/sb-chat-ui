import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorId: '' 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.state.errorId}] Error caught by boundary:`, error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-600 font-semibold">Something went wrong</h3>
          <p className="text-red-500 text-sm mt-2">
            An error occurred while rendering this component.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-red-500 whitespace-pre-wrap font-mono text-xs mt-2 p-2 bg-red-100 rounded">
              {this.state.error?.stack}
            </pre>
          )}
          <div className="mt-3 text-xs text-muted-foreground">
            Error ID: {this.state.errorId}
          </div>
          {this.props.showRetry !== false && (
            <div className="mt-3">
              <button
                onClick={this.handleRetry}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
