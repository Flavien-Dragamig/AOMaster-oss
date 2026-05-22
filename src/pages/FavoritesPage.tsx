import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { FavoritesList } from '../components/favorites/FavoritesList';

const FavoritesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-peach-600 mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Retour au tableau de bord
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Star size={32} className="text-yellow-500 fill-current" />
          <h1 className="text-3xl font-bold text-gray-900">Mes favoris</h1>
        </div>
        <p className="text-gray-600 mt-1">
          Retrouvez toutes les annonces que vous avez sauvegardées en favoris.
        </p>
      </div>

      <FavoritesList />
    </div>
  );
};

export default FavoritesPage;
