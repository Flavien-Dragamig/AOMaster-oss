import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Settings, User, Shield, Bell, Star } from 'lucide-react';
import { useFavoritesCount } from '../hooks/useFavorites';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
  const [message, setMessage] = useState<{type: string, text: string} | null>(null);
  const { count: favoritesCount } = useFavoritesCount();

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        // Récupérer l'utilisateur courant
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Récupérer les paramètres (si implémentés dans le futur)
          // Exemple: récupérer les préférences de notification
          // Ceci est simulé pour le moment
          setEmailNotifications(true);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserSettings();
  }, []);
  
  const saveSettings = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Simuler la sauvegarde des paramètres
      // Dans une implémentation réelle, vous enregistreriez cela dans Supabase
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMessage({
        type: 'success',
        text: 'Paramètres sauvegardés avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la sauvegarde des paramètres'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="mr-2 h-6 w-6" />
          Paramètres
        </h1>
        <p className="text-gray-600 mt-1">
          Configurez les options de votre compte et les préférences de notification.
        </p>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        {/* Section Compte */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Informations du compte</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="shadow-sm focus:ring-peach-500 focus:border-peach-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Pour changer votre email, contactez le support.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Favoris */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Marchés favoris</h2>
            </div>
            <span className="text-2xl font-bold text-gray-900">{favoritesCount}</span>
          </div>

          <p className="text-sm text-gray-500 mb-4">
            Gérez vos annonces favorites et retrouvez-les facilement.
          </p>

          <button
            type="button"
            onClick={() => navigate('/settings/favorites')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
          >
            <Star className="h-4 w-4 mr-2" />
            Voir mes favoris
          </button>
        </div>

        {/* Section Sécurité */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Sécurité</h2>
          </div>

          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
          >
            Changer de mot de passe
          </button>
        </div>

        {/* Section Notifications */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-notifications"
                  name="email-notifications"
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="focus:ring-peach-500 h-4 w-4 text-peach-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="email-notifications" className="font-medium text-gray-700">Notifications par email</label>
                <p className="text-gray-500">Recevoir des emails pour les alertes et les nouveaux marchés correspondant à vos critères.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 disabled:opacity-50"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
