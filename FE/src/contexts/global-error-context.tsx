'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import ErrorResultModal from '@/components/modals/error-result.modal';

interface GlobalErrorContextType {
  showError: (message: string) => void;
  hideError: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | null>(null);

// Global function để gọi từ fetch wrapper (không cần hook)
let globalShowError: ((message: string) => void) | null = null;

export function setGlobalErrorHandler(handler: (message: string) => void) {
  globalShowError = handler;
}

export function triggerGlobalError(message: string) {
  if (globalShowError) {
    globalShowError(message);
  } else {
    // Fallback: console error nếu chưa init
    console.error('Global error:', message);
  }
}

export function GlobalErrorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    setIsOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setIsOpen(false);
    setErrorMessage('');
  }, []);

  // Register global handler on mount
  useEffect(() => {
    setGlobalErrorHandler(showError);
    return () => {
      globalShowError = null;
    };
  }, [showError]);

  return (
    <GlobalErrorContext.Provider value={{ showError, hideError }}>
      {children}
      <ErrorResultModal isOpen={isOpen} onClose={hideError} message={errorMessage} />
    </GlobalErrorContext.Provider>
  );
}

export function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within GlobalErrorProvider');
  }
  return context;
}
