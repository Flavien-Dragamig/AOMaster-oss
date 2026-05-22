import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingFirstLogin, setCheckingFirstLogin] = useState(true);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) {
        setCheckingFirstLogin(false);
        return;
      }

      if (location.pathname === '/force-password-change') {
        setCheckingFirstLogin(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('first_login_completed, auth_provider')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking first login:', error);
          setCheckingFirstLogin(false);
          return;
        }

        // Seuls les utilisateurs email doivent changer leur mot de passe au premier login
        if (data && data.first_login_completed === false && data.auth_provider === 'email') {
          setNeedsPasswordChange(true);
        }
      } catch (error) {
        console.error('Error checking first login:', error);
      } finally {
        setCheckingFirstLogin(false);
      }
    };

    checkFirstLogin();
  }, [user, location.pathname]);

  if (loading || checkingFirstLogin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peach-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (needsPasswordChange && location.pathname !== '/force-password-change') {
    return <Navigate to="/force-password-change" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;