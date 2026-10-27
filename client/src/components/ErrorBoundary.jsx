import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Thalify ErrorBoundary caught an error]:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-3xl border border-mocha-200 p-8 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl shadow-xs">
              🍱
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-serif font-extrabold text-mocha-950">
                Something went wrong
              </h1>
              <p className="text-xs text-mocha-600 leading-relaxed">
                We encountered an unexpected interface state. Your data is completely safe.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-[11px] font-mono text-rose-800 break-words">
                {this.state.error.message}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-smooth cursor-pointer"
              >
                Refresh View
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="w-full sm:w-auto px-5 py-2.5 bg-mocha-100 hover:bg-mocha-200 text-mocha-900 text-xs font-bold rounded-xl transition-smooth cursor-pointer"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
