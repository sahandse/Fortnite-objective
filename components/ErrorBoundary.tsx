"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{
            textAlign: "center",
            padding: "80px 20px",
            color: "var(--c-muted)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
              خطایی رخ داده است
            </p>
            <p style={{ fontSize: 13, color: "var(--c-dim)" }}>
              {this.state.error?.message || "خطای نامشخص"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn btn-primary"
              style={{ marginTop: 16 }}
            >
              تلاش مجدد
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}