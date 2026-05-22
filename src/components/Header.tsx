import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Bell, User, Menu, X, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useAlerts } from '../hooks/useAlerts';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { alerts } = useAlerts();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClass = (path: string) => {
    const baseClass = "inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 border-transparent transition-colors duration-200";
    const activeClass = "text-gray-900";
    const inactiveClass = "text-gray-500 hover:text-peach-600 hover:underline";

    return `${baseClass} ${isActive(path) ? activeClass : inactiveClass}`;
  };
  
  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!error && data?.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Gestion des clics en dehors du menu utilisateur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-peach-600 font-bold text-xl">AOMaster</span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link to="/" className={getLinkClass('/')}>
                Accueil
              </Link>
              <Link to="/search" className={getLinkClass('/search')}>
                Rechercher
              </Link>
              {user && (
                <>
                  <Link to="/dashboard" className={getLinkClass('/dashboard')}>
                    Tableau de bord
                  </Link>
                  <Link to="/alerts" className={getLinkClass('/alerts')}>
                    Alertes
                  </Link>
                </>
              )}
            </nav>
          </div>
          
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/alerts" className="relative p-1 rounded-full text-gray-500 hover:text-peach-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 transition-colors duration-200">
                  <Bell size={20} />
                  {alerts && alerts.length > 0 && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-peach-500"></span>
                  )}
                </Link>
                
                <div className="relative" ref={userMenuRef}>
                  <div>
                    <button 
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-peach-600 transition-colors duration-200"
                    >
                      <span className="sr-only">Ouvrir le menu utilisateur</span>
                      <User className="h-5 w-5 mr-1" />
                      <span>{user.email}</span>
                    </button>
                    
                    <div className={`${userMenuOpen ? 'block' : 'hidden'} absolute right-0 w-48 py-1 mt-2 bg-white rounded-md shadow-lg z-10 transition-all duration-200`}>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 font-medium" onClick={() => setUserMenuOpen(false)}>
                          <Shield className="inline h-4 w-4 mr-2" />
                          Administration
                        </Link>
                      )}
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                        Tableau de bord
                      </Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                        Mon Profil
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>
                        Paramètres
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-peach-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 transition-colors duration-200"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 transition-colors duration-200"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-peach-500"
            >
              <span className="sr-only">Ouvrir le menu principal</span>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/')
                  ? 'border-gray-900 text-gray-900 bg-gray-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-peach-300 hover:text-peach-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/search"
              className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive('/search')
                  ? 'border-gray-900 text-gray-900 bg-gray-50'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-peach-300 hover:text-peach-600'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Rechercher
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/dashboard')
                      ? 'border-gray-900 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-peach-300 hover:text-peach-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tableau de bord
                </Link>
                <Link
                  to="/alerts"
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive('/alerts')
                      ? 'border-gray-900 text-gray-900 bg-gray-50'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-peach-300 hover:text-peach-600'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Alertes
                </Link>
              </>
            )}
          </div>
          
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-peach-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-peach-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-base font-medium text-orange-600 hover:text-orange-800 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center">
                        <Shield className="mr-2 h-5 w-5" />
                        Administration
                      </div>
                    </Link>
                  )}
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Tableau de bord
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mon Profil
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Paramètres
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-5 w-5" />
                      Se déconnecter
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1 px-4">
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-peach-600 hover:text-peach-800 hover:bg-gray-100"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-4 py-2 text-base font-medium text-white bg-peach-600 hover:bg-peach-700 rounded-md"
                >
                  S'inscrire
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;