import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class StartupErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ENH startup] React failed to render:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: '100vh', padding: 24, boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 680, margin: '8vh auto', padding: 24, border: '1px solid #cbd5e1', borderRadius: 16, background: '#fff' }}>
            <h1 style={{ marginTop: 0 }}>ENH Restaurant Aide could not load</h1>
            <p>The interface encountered a startup error. Copy the details below and share them with support.</p>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', padding: 12, borderRadius: 8, background: '#f1f5f9' }}>{this.state.error.message || String(this.state.error)}</pre>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 16px', border: 0, borderRadius: 8, background: '#1f4d3e', color: '#fff' }}>Reload app</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}
