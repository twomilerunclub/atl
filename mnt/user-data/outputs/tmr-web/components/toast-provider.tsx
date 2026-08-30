'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/** Replaces the original global toast() function with a typed React context. */
const ToastContext = createContext<(message: string) => void>(() => {});

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const toast = useCallback((next: string) => {
    setMessage(next);
    setShow(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2600);
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div id="toast" role="status" className={show ? 'show' : ''}>
        {message}
      </div>
    </ToastContext.Provider>
  );
}
