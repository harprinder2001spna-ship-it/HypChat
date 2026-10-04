import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { App as CapApp } from '@capacitor/app';

// Auto-route /api requests to live backend when running inside native Android wrapper
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  const backendUrl = import.meta.env.VITE_API_URL || 'https://ais-pre-7kjb3mb2jjoz6eupeutzqa-613935602338.asia-southeast1.run.app';

  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const isCapacitor = Boolean((window as any).Capacitor?.isNativePlatform?.());
    const isLocalScheme = window.location.origin.includes('localhost') || window.location.origin.startsWith('capacitor://');

    if (isCapacitor && isLocalScheme && typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`${backendUrl}${input}`, init);
    }
    return originalFetch(input, init);
  };

  // Hardware back button support for Android
  try {
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        CapApp.exitApp();
      }
    });
  } catch {
    // Non-native browser environment
  }
}

createRoot(document.getElementById('root')!).render(<App />);
