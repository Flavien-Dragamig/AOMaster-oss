import { useState } from 'react';
import { Star, Trash2, Copy, Calendar, Hash } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useToast } from '../../contexts/ToastContext';
import type { SavedSearch, SearchFilters } from '../../types';
import { format } from 'date-fns';

interface SavedSearchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSearch: (searchParams: SearchFilters) => void;
}

export function SavedSearchesModal({
  isOpen,
  onClose,
  onLoadSearch,
}: SavedSearchesModalProps) {
  const {
    savedSearches,
    favoriteSearches,
    isLoading,
    deleteSavedSearch,
    toggleFavorite,
    duplicateSavedSearch,
    incrementUseCount,
  } = useSavedSearches();
  const { showToast } = useToast();

  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const displayedSearches = showOnlyFavorites ? favoriteSearches : savedSearches;

  const handleLoadSearch = async (search: SavedSearch) => {
    try {
      await incrementUseCount(search.id);
      onLoadSearch(search.searchParams);
      showToast('Recherche chargée avec succès', 'success');
      onClose();
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showToast('Erreur lors du chargement', 'error');
    }
  };

  const handleToggleFavorite = async (id: string, currentValue: boolean) => {
    try {
      await toggleFavorite({ id, isFavorite: !currentValue });
      showToast(
        currentValue ? 'Retiré des favoris' : 'Ajouté aux favoris',
        'success'
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour des favoris:', error);
      showToast('Erreur lors de la mise à jour', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette recherche ?')) {
      setDeletingId(id);
      try {
        await deleteSavedSearch(id);
        showToast('Recherche supprimée', 'success');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showToast('Erreur lors de la suppression', 'error');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateSavedSearch(id);
      showToast('Recherche dupliquée avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
      showToast('Erreur lors de la duplication', 'error');
    }
  };

  const getSearchSummary = (params: SearchFilters): string => {
    const parts: string[] = [];

    if (params.query) parts.push(`"${params.query}"`);
    if (params.departments?.length) {
      parts.push(`${params.departments.length} département(s)`);
    }
    if (params.categories?.length) {
      parts.push(`${params.categories.length} catégorie(s)`);
    }
    if (params.contractType) {
      parts.push(params.contractType);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Aucun critère';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mes recherches sauvegardées">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant={showOnlyFavorites ? 'primary' : 'outline'}
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className="text-sm"
          >
            <Star className="w-4 h-4 mr-2" />
            {showOnlyFavorites ? 'Toutes les recherches' : 'Favoris uniquement'}
          </Button>
          <span className="text-sm text-gray-600">
            {displayedSearches.length} recherche(s)
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement...</p>
          </div>
        ) : displayedSearches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>
              {showOnlyFavorites
                ? 'Aucune recherche favorite'
                : 'Aucune recherche sauvegardée'}
            </p>
            <p className="text-sm mt-2">
              Sauvegardez vos recherches pour y accéder rapidement
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {displayedSearches.map((search) => (
              <div
                key={search.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{search.name}</h3>
                      {search.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    {search.description && (
                      <p className="text-sm text-gray-600 mt-1">{search.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleToggleFavorite(search.id, search.isFavorite)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title={search.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          search.isFavorite
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleDuplicate(search.id)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(search.id)}
                      disabled={deletingId === search.id}
                      className="p-1.5 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  {getSearchSummary(search.searchParams)}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {search.useCount} utilisation(s)
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(search.createdAt), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleLoadSearch(search)}
                    className="text-xs"
                  >
                    Charger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
