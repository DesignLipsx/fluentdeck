/// <reference types="vite/client" />
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { injectSpeedInsights } from '@vercel/speed-insights';
import App from './App';
import "./index.css";

// Initialize Vercel Speed Insights
injectSpeedInsights();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Only register service worker in production
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Add a check to see if the app has crashed and reload if it has.
// This is a workaround for the white screen issue when the app is open for a long time.
let hasRendered = false;

const observer = new MutationObserver(() => {
  if (rootElement.hasChildNodes()) {
    hasRendered = true;
    observer.disconnect(); // Stop observing once we have content.
  }
});

observer.observe(rootElement, { childList: true });

setInterval(() => {
  if (hasRendered && !rootElement.hasChildNodes()) {
    window.location.reload();
  }
}, 1800000); // Check every 30 minutes