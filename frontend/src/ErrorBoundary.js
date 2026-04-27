import React from "react";
import { safeAlert } from "./utils/safeAlert";

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("⚠️ Error Boundary caught:", error, errorInfo);
    safeAlert(`⚠️ Application error: ${error?.message || "Unknown render error"}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "#d32f2f",
            backgroundColor: "#ffebee",
            borderRadius: "8px",
            margin: "20px",
          }}
        >
          <h2>❌ Something went wrong</h2>
          <p
            style={{
              color: "#c62828",
              fontFamily: "monospace",
              marginTop: "10px",
            }}
          >
            {this.state.error?.message}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              backgroundColor: "#d32f2f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            🔄 Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
