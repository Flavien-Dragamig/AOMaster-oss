/**
 * @fileoverview Main application layout wrapper component.
 * Provides a consistent structure for all pages with the header, content area,
 * and future expansion points like footer or sidebar.
 */

import React, { ReactNode } from 'react';
import Header from '../Header';
import { X } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * Toast notification component for app-wide messages
 */
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const bgColors = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error: 'bg-red-50 border-red-400 text-red-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
  };

  return (
    <div className={`rounded-md p-4 mb-4 border-l-4 ${bgColors[type]} flex justify-between items-center`}>
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="ml-auto flex-shrink-0 flex">
        <X size={18} className="cursor-pointer" />
      </button>
    </div>
  );
};

/**
 * Main application layout component that wraps all pages.
 * Includes header, main content area, and space for future elements like footer.
 */
const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Example toast state - in a real app, this would be managed by a context
  const [toasts, setToasts] = React.useState<Array<{ id: string; message: string; type: ToastProps['type'] }>>([]);

  // Example function to show a toast notification
  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts((currentToasts) => [...currentToasts, { id, message, type }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  // For demonstration - you can expose this via context to use throughout the app
  React.useEffect(() => {
    // This would normally be called from event handlers or API responses
    // showToast('Bienvenue sur AOMaster!', 'info');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Toast notifications container */}
      <div className="fixed top-5 right-5 z-50 space-y-2 w-72">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Footer placeholder */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} AOMaster - Tous droits réservés
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sm text-gray-500 hover:text-peach-600">
                À propos
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-peach-600">
                Confidentialité
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-peach-600">
                CGU
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
