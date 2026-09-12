import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "#030712",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}>
          <div style={{ maxWidth: "420px" }}>
            <h2 style={{ margin: "0 0 12px", color: "#f59e0b" }}>Something went wrong</h2>
            <p style={{ margin: "0 0 20px", color: "#a8b3c7", fontSize: "0.9rem", lineHeight: 1.5 }}>
              The app hit an error on this device. Try refreshing, or open it in Chrome/Safari or your wallet&apos;s in-app browser (MetaMask, Trust Wallet).
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                border: "none",
                color: "#fff",
                padding: "12px 24px",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
