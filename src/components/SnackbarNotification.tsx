import React, { useEffect, useState } from 'react';
import { RotateCcw, Trash2, X, CheckCircle2, AlertCircle } from 'lucide-react';

export interface SnackbarNotificationProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  variant?: 'trash' | 'success' | 'info';
  onUndo?: () => void;
  onViewTrash?: () => void;
  onClose: () => void;
  durationMs?: number;
}

export const SnackbarNotification: React.FC<SnackbarNotificationProps> = ({
  isOpen,
  title,
  subtitle,
  variant = 'trash',
  onUndo,
  onViewTrash,
  onClose,
  durationMs = 7000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) {
      setProgress(100);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / durationMs) * 100);
      setProgress(remainingPct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isOpen, durationMs, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="deletion-undo-snackbar"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg animate-in fade-in slide-in-from-bottom-5 duration-200"
      role="alert"
      aria-live="assertive"
    >
      <div className="relative overflow-hidden bg-[#16211b] border border-[#2b3e34] text-white shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-3">
        {/* Progress bar countdown */}
        <div
          className="absolute bottom-0 left-0 h-1 bg-[#d97706] transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />

        {/* Left icon and message */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-[#25392e] border border-[#344d3f] flex items-center justify-center shrink-0 text-[#f59e0b]">
            {variant === 'trash' ? (
              <Trash2 className="w-5 h-5" />
            ) : variant === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-sky-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{title}</h4>
            {subtitle && (
              <p className="text-xs text-[#a0b0a7] truncate font-medium mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onUndo && (
            <button
              type="button"
              id="snackbar-undo-btn"
              onClick={() => {
                onUndo();
                onClose();
              }}
              className="bg-[#d97706] hover:bg-[#b45309] text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Undo</span>
            </button>
          )}

          {onViewTrash && (
            <button
              type="button"
              id="snackbar-view-trash-btn"
              onClick={() => {
                onViewTrash();
                onClose();
              }}
              className="text-xs font-semibold text-stone-300 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              View Bin
            </button>
          )}

          <button
            type="button"
            id="snackbar-close-btn"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
