import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        // --- Cas email : signup ---
        if (type === 'signup' && accessToken) {
          const { data: { user }, error } = await supabase.auth.getUser(accessToken);
          if (error) throw error;

          if (user) {
            setStatus('success');
            setMessage('Votre email a été confirmé avec succès !');
            setTimeout(() => navigate('/dashboard'), 2000);
          }
          return;
        }

        // --- Cas email : recovery ---
        if (type === 'recovery' && accessToken) {
          const refreshToken = hashParams.get('refresh_token') || '';
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;

          setStatus('success');
          setMessage('Vous pouvez maintenant réinitialiser votre mot de passe');
          setTimeout(() => navigate('/reset-password'), 2000);
          return;
        }

        // --- Cas email : invite (magic link) ---
        if (type === 'invite' && accessToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          if (sessionError) throw sessionError;

          setStatus('success');
          setMessage('Bienvenue ! Vous allez créer votre mot de passe...');
          setTimeout(() => navigate('/force-password-change'), 2000);
          return;
        }

        // --- Cas OAuth (retour Google via PKCE ou implicit) ---
        // Attendre que la session soit établie par le SDK Supabase
        const maxWait = 5000;
        const start = Date.now();
        let session = null;

        while (Date.now() - start < maxWait) {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            session = data.session;
            break;
          }
          await new Promise(r => setTimeout(r, 500));
        }

        if (session) {
          // Vérifier si le profil est complet
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('first_name, business_sector, auth_provider')
            .eq('user_id', session.user.id)
            .maybeSingle<{ first_name: string | null; business_sector: string | null; auth_provider: string }>();

          const needsProfileCompletion =
            profile?.auth_provider !== 'email' &&
            (!profile?.first_name || !profile?.business_sector);

          setStatus('success');
          if (needsProfileCompletion) {
            setMessage('Connexion réussie ! Complétez votre profil...');
            setTimeout(() => navigate('/complete-profile'), 1500);
          } else {
            setMessage('Connexion réussie !');
            setTimeout(() => navigate('/dashboard'), 1500);
          }
          return;
        }

        throw new Error('Lien de confirmation invalide');
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la confirmation');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <Loader className="mx-auto h-12 w-12 text-peach-500 animate-spin" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Confirmation en cours...
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Veuillez patienter pendant que nous confirmons votre compte
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Confirmation réussie
                </h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <p className="mt-4 text-sm text-gray-500">
                  Redirection en cours...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Erreur de confirmation
                </h2>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
                >
                  Retour à la connexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
