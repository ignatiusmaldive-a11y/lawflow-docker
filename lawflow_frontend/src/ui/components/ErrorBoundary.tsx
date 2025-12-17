import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="card cardPad" style={{ textAlign: "center", maxWidth: "400px", margin: "40px auto" }}>
          <h2 style={{ color: "var(--danger)", marginBottom: "16px" }}>Something went wrong</h2>
          <p style={{ color: "var(--muted)", marginBottom: "20px" }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <details style={{ marginTop: "20px", textAlign: "left" }}>
              <summary style={{ cursor: "pointer", color: "var(--muted)" }}>
                Error Details (Development)
              </summary>
              <pre style={{
                background: "var(--panel)",
                padding: "12px",
                borderRadius: "8px",
                marginTop: "8px",
                fontSize: "12px",
                overflow: "auto",
                color: "var(--danger)"
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}