"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "info", duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none p-4">
        {toasts.map((t) => {
          let Icon = Info;
          let bgColor = "bg-white border-neutral-200 text-neutral-900";
          let iconColor = "text-neutral-500";

          switch (t.type) {
            case "success":
              Icon = CheckCircle;
              bgColor = "bg-white border-neutral-900 text-neutral-900";
              iconColor = "text-neutral-900";
              break;
            case "error":
              Icon = AlertCircle;
              bgColor = "bg-white border-neutral-200 text-neutral-900";
              iconColor = "text-neutral-900 font-bold";
              break;
            case "warning":
              Icon = AlertTriangle;
              bgColor = "bg-white border-neutral-200 text-neutral-900";
              iconColor = "text-neutral-600";
              break;
          }

          return (
            <div
              key={t.id}
              className={`toast-enter flex items-center justify-between p-3.5 rounded-[6px] border shadow-sm ${bgColor} pointer-events-auto transition-all duration-200 w-full`}
              role="alert"
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
                <p className="text-xs font-medium leading-normal">{t.message}</p>
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-4 text-neutral-400 hover:text-neutral-900 transition-colors p-0.5 rounded-[4px] hover:bg-neutral-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
