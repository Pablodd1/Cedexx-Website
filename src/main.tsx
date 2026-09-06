import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Initialize Google Analytics 4 if measurement ID is configured
const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID || (window as any).GA_MEASUREMENT_ID || '').trim();
if (gaId && gaId !== 'G-PLACEHOLDER' && !document.querySelector(`script[src*="${gaId}"]`)) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
  document.head.appendChild(script);

  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function(...args: any[]) { w.dataLayer.push(args); };
  }
  w.gtag('js', new Date());
  w.gtag('config', gaId, { send_page_view: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
