'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  title?: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
      const id = `${Date.now()}-${Math.random()}`;
      const defaultTitle =
        title || (type === 'success' ? 'Perubahan Tersimpan' : type === 'error' ? 'Gagal Menyimpan' : 'Informasi');

      setToasts((prev) => [...prev, { id, message, title: defaultTitle, type }]);

      // Auto dismiss after 3.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showToast(message, 'success', title);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showToast(message, 'error', title);
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError }}>
      {children}

      {/* Floating Toast Notification Container (Top-Right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto transform transition-all duration-300 ease-out translate-y-0 opacity-100 flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-[#14191F]/95 text-white border-emerald-500/40 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-[#2A1418]/95 text-white border-red-500/40 shadow-red-950/20'
                : 'bg-[#14191F]/95 text-white border-[#5C7489]/40 shadow-black/20'
            }`}
          >
            {/* Status Icon */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-6 h-6 rounded-full bg-[#5C7489]/30 text-[#A6C0D4] flex items-center justify-center">
                  <Info className="w-4 h-4 text-[#A6C0D4]" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                {toast.title}
                {toast.type === 'success' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </h4>
              <p className="text-[11px] text-[#A6B4C2] mt-0.5 leading-relaxed break-words">
                {toast.message}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-[#6F8192] hover:text-white transition-colors p-1 -mr-1 -mt-1 rounded-lg"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
