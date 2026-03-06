// components/admin/Toast.tsx
'use client';

import React, { useState, createContext, useContext, useRef } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'jade' | 'rose' | 'sky' | 'gold';
}

interface ToastContextType {
  toast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeqRef = useRef(0);

  const toast = (message: string, type: Toast['type'] = 'jade') => {
    toastSeqRef.current += 1;
    const id = `${Date.now()}-${toastSeqRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast t-${t.type}`} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            <div className="toast-ico">
              <i className={`fa-solid ${
                t.type === 'jade' ? 'fa-check-circle' : 
                t.type === 'rose' ? 'fa-circle-exclamation' : 
                t.type === 'sky' ? 'fa-info-circle' : 'fa-triangle-exclamation'
              }`}></i>
            </div>
            <div className="toast-msg">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
