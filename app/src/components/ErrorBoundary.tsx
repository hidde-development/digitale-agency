'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
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

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg-light)] px-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              ⚠️
            </div>
            <h2 className="mb-2 text-lg font-semibold text-[var(--text-primary)]">
              Er ging iets mis
            </h2>
            <p className="mb-6 text-sm text-[var(--text-secondary)]">
              {this.state.error?.message || 'Er is een onverwachte fout opgetreden.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="rounded-xl bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Opnieuw laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
