import React from 'react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by error boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // You can also log to a monitoring service like Sentry here
  }

  handleRefresh = () => {
    window.location.reload();
  }

  handleGoHome = () => {
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-white rounded-2xl shadow-card p-8 max-w-lg w-full">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Something Went Wrong</h2>
            <p className="text-gray-600 mb-6">
              We apologize, but something went wrong. Please try refreshing the page or return to the homepage.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 text-left">
                <details className="bg-gray-100 p-4 rounded-md">
                  <summary className="text-sm text-gray-800 font-medium cursor-pointer">
                    Technical Error Details
                  </summary>
                  <div className="mt-2 text-xs font-mono text-red-800 overflow-auto max-h-60">
                    <p>{this.state.error.toString()}</p>
                    <p className="mt-2 text-gray-700">
                      {this.state.errorInfo?.componentStack}
                    </p>
                  </div>
                </details>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleRefresh} variant="primary">
                Refresh Page
              </Button>
              <Button onClick={this.handleGoHome} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
