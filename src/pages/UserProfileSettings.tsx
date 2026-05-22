import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import RegionalDepartmentSelector from '../components/tenders/RegionalDepartmentSelector';
import { getCurrentUserProfile, saveUserProfile, getUserFacetPreferences, saveAllUserFacetPreferences } from '../services/userProfile';

const UserProfileSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<Record<string, string[]>>({});
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Charger le profil utilisateur et ses préférences
  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          
          // Charger le profil avec la nouvelle fonction du service
          const profileData = await getCurrentUserProfile();
          
          // Si le profil existe, mettre à jour le state
          if (profileData) {
            setProfile(profileData);
            setDisplayName(profileData.display_name || '');
          }
          
          // Charger les préférences de facettes avec la nouvelle fonction du service
          const facetPrefs = await getUserFacetPreferences();
          
          if (Object.keys(facetPrefs).length > 0) {
            setPreferences(facetPrefs);
          } else {
            // Initialiser avec un objet vide pour éviter les erreurs
            setPreferences({ departments: [] });
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setMessage({ type: 'error', text: 'Erreur lors du chargement du profil' });
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, []);
  
  // Gérer la sélection des départements par défaut
  const handleFacetChange = (name: string, value: string, checked: boolean) => {
    setPreferences(prev => {
      const newPrefs = { ...prev };
      
      if (!newPrefs[name]) {
        newPrefs[name] = [];
      }
      
      if (checked) {
        if (!newPrefs[name].includes(value)) {
          newPrefs[name] = [...newPrefs[name], value];
        }
      } else {
        newPrefs[name] = newPrefs[name].filter(v => v !== value);
      }
      
      return newPrefs;
    });
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);
  };
  
  // Sauvegarder les préférences et profil
  const saveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Mise à jour du profil avec la fonction du service
      const updatedProfile = await saveUserProfile({
        display_name: displayName
      });
      
      // Sauvegarde des préférences de facettes avec la fonction du service
      const prefsUpdated = await saveAllUserFacetPreferences(preferences);
      
      if (updatedProfile && prefsUpdated) {
        setMessage({ type: 'success', text: 'Profil sauvegardé avec succès!' });
      } else {
        setMessage({ type: 'error', text: 'Certaines données n\'ont pas pu être sauvegardées' });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde du profil' });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !user) return (
    <div className="container mx-auto p-4 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
    </div>
  );
  
  if (!user) return (
    <div className="container mx-auto p-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <p className="text-yellow-700">
            Vous devez être connecté pour accéder à cette page.
          </p>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6">Paramètres du profil</h1>
      
      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}
      
      {/* Informations de base */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
          </div>
          
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
              Nom d'affichage
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={handleNameChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Préférences de recherche */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Préférences de recherche</h2>
        
        <div className="mb-6">
          <h3 className="font-medium mb-2">Départements par défaut</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ces départements seront automatiquement sélectionnés lors de vos recherches.
          </p>
          
          <RegionalDepartmentSelector
            selectedFacets={preferences}
            onFacetChange={handleFacetChange}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
        </button>
      </div>
    </div>
  );
};

export default UserProfileSettings;
