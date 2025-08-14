import React from 'react';
import SuccessDialog from '../components/SuccessDialog';

const SuccessDialogContext = React.createContext<{
  visible: boolean;
  show: () => void;
  hide: () => void;
  flash: (ms?: number) => void;
} | null>(null);

export function useSuccessDialog() {
  const context = React.useContext(SuccessDialogContext);
  if (!context) {
    throw new Error('useSuccessDialog must be used within a SuccessDialogProvider');
  }
  return context;
}

export function SuccessDialogProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const show = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(true);
  }, []);

  const hide = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  const flash = React.useCallback((ms: number = 1400) => {
    show();
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      timerRef.current = null;
    }, ms);
  }, [show]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <SuccessDialogContext.Provider value={{ visible, show, hide, flash }}>
      <SuccessDialog visible={visible} />
      {children}
    </SuccessDialogContext.Provider>
  );
}


