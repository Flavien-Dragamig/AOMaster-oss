import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Échec de l\'envoi de l\'email de réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                Vérifiez votre boîte mail
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.
                Le lien est valide pendant <strong>1 heure</strong>.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Pensez à vérifier vos spams si vous ne recevez rien.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="text-peach-600 hover:text-peach-500 font-medium"
                >
                  Retour à la connexion
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Mot de passe oublié
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-peach-500 focus:border-peach-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Vous vous souvenez de votre mot de passe?{' '}
            <Link to="/login" className="font-medium text-peach-600 hover:text-peach-500">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
