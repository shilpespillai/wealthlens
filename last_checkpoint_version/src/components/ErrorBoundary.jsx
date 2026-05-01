import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("WealthLens Crash:", error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-rose-500">⚠️</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Platform Crash Detected</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              WealthLens encountered a critical system error. We've captured the diagnostics below.
            </p>
            
            <div className="bg-slate-900 rounded-2xl p-6 mb-8 text-left overflow-x-auto">
              <p className="text-rose-400 font-mono text-xs font-bold mb-2 uppercase tracking-widest">Error Trace:</p>
              <pre className="text-slate-300 font-mono text-[10px] leading-relaxed max-h-[200px] overflow-y-auto">
                {this.state.error && this.state.error.toString()}
                {"\n\nComponent Stack:\n"}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReset}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all"
              >
                Hard Reset & Refresh
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-4 bg-white text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                Attempt Simple Reload
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
