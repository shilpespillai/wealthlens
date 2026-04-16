import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical UI Crash:", error, errorInfo);
  }

  handleReset = () => {
    // Clear potentially corrupt local data
    localStorage.removeItem("wealthlens-calc-state");
    localStorage.removeItem("wealthlens-theme");
    // Force reload to root
    window.location.href = "/Dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 p-10 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-rose-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Terminal Interrupted</h1>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              We encountered a runtime exception while synchronizing your production data. This is often caused by missing profile parameters in a new account.
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-semibold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset & Try Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/"}
                className="w-full border-slate-200 text-slate-600 rounded-xl h-12 font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">Error Code</p>
              <code className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded mt-1 block truncate">
                {this.state.error?.message || "Unknown Runtime Crash"}
              </code>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
