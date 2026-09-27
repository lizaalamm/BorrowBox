import { Component } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

/**
 * Catches render errors so a single broken view cannot blank the whole product.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('[BorrowBox] Unexpected UI error:', error, info?.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="shell flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300">
          <TriangleAlert className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-[26px] font-bold tracking-[-0.02em]">Something went wrong</h1>
        <p className="mt-3 max-w-[440px] text-[15px] text-zinc-600 dark:text-zinc-400">
          This page hit an unexpected error. Reloading usually fixes it, and nothing you saved has been lost.
        </p>
        <button type="button" onClick={this.handleReload} className="btn btn-primary btn-md mt-7">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reload page
        </button>
      </div>
    );
  }
}
