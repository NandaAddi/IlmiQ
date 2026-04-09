import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-red-100 p-8 text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-800 mb-3">Aduh! Ada Gangguan</h1>
            <p className="text-slate-500 mb-8">
              Terjadi kesalahan teknis yang tidak terduga. Jangan khawatir, progres Anda tetap aman di Supabase.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-slate-50 text-slate-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
              >
                <Home className="w-4 h-4" /> Kembali ke Dashboard
              </button>
            </div>

            {/* Vite uses import.meta.env instead of process.env */}
            {import.meta.env.DEV && (
              <div className="mt-8 p-4 bg-slate-100 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-slate-500 whitespace-pre">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
