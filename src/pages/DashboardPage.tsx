import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Settings, Search, Star } from 'lucide-react';
import { useFavorites, useFavoritesCount } from '../hooks/useFavorites';
import { formatDate } from '../lib/utils/format';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { count: favoritesCount } = useFavoritesCount();
  const { favorites } = useFavorites();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">
          Gérez vos alertes et suivez vos marchés publics favoris.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-peach-100 p-3 rounded-full">
              <Bell className="h-6 w-6 text-peach-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">0</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900">Alertes actives</h3>
          <p className="text-sm text-gray-500 mt-1">Notifications configurées</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-peach-100 p-3 rounded-full">
              <Search className="h-6 w-6 text-peach-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">0</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900">Recherches sauvegardées</h3>
          <p className="text-sm text-gray-500 mt-1">Critères enregistrés</p>
        </div>

        <div
          onClick={() => navigate('/settings/favorites')}
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{favoritesCount}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-900">Marchés favoris</h3>
          <p className="text-sm text-gray-500 mt-1">Opportunités suivies</p>
        </div>

        <div 
          onClick={() => navigate('/settings')} 
          className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-peach-100 p-3 rounded-full">
              <Settings className="h-6 w-6 text-peach-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-900">Paramètres</h3>
          <p className="text-sm text-gray-500 mt-1">Configuration du compte</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Dernières alertes</h2>
            <div className="text-sm text-gray-500 text-center py-8">
              Aucune alerte configurée
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Marchés favoris récents</h2>
              {favorites.length > 0 && (
                <Link
                  to="/settings/favorites"
                  className="text-sm text-peach-600 hover:text-peach-700 font-medium"
                >
                  Voir tout
                </Link>
              )}
            </div>
            {favorites.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-8">
                <Star size={32} className="mx-auto mb-2 text-gray-300" />
                Aucun marché en favori
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.slice(0, 3).map((favorite) => {
                  const contract = favorite.contractData;
                  return (
                    <Link
                      key={favorite.id}
                      to={`/contracts/${contract.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:border-peach-500 hover:bg-peach-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                            {contract.title}
                          </h3>
                          <p className="text-xs text-gray-600 truncate mb-1">
                            {contract.contractingAuthority.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ajouté le {formatDate(new Date(favorite.createdAt))}
                          </p>
                        </div>
                        <Star size={16} className="text-yellow-500 fill-current flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;