import React from "react";
import PropTypes from "prop-types";

/**
 * Enterprise-grade Error Boundary for AkaTech IT Solutions.
 * Prevents uncaught React render exceptions from crashing the application into a blank screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("AkaTech ErrorBoundary caught an uncaught exception:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === "function"
          ? this.props.fallback({
              error: this.state.error,
              reset: this.handleReset,
            })
          : this.props.fallback;
      }

      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0a0a0a] text-white">
          <div className="max-w-md w-full bg-[#141414] border border-[#c5a059]/30 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#c5a059]/10 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-serif font-bold text-white mb-2">
              Application Encountered an Issue
            </h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              We encountered an unexpected error while loading this component. Your session data is intact.
            </p>

            {isDev && this.state.error && (
              <div className="mb-6 text-left p-3 bg-red-950/30 border border-red-500/20 rounded-lg overflow-x-auto text-xs text-red-300 font-mono">
                <p className="font-bold mb-1">{this.state.error.toString()}</p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] text-gray-400 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-[#c5a059] text-black font-semibold text-sm hover:bg-[#eedc9a] transition-colors shadow-lg cursor-pointer"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-colors cursor-pointer border border-white/10"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  onError: PropTypes.func,
  onReset: PropTypes.func,
};
