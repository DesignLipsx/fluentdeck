
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import AdminPage from './pages/AdminPage';
import AdminDashboard from './pages/AdminDashboard';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './hooks/useAuth';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const validAppPaths = ['', 'apps', 'icons', 'emoji', 'about', 'contribute'];

const Router: React.FC = () => {
  const { pathname } = window.location;
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'dashboard') {
    return <AdminDashboard />;
  }
  
  if (segments[0] === 'admin' || segments[0] === 'login') {
    return <AdminPage />;
  }

  if (segments.length === 0 || (segments.length === 1 && validAppPaths.includes(segments[0]))) {
    return <App />;
  }

  return <NotFoundPage />;
};

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </React.StrictMode>
);