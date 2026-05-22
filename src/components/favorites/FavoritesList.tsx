import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { removeFavorite } from '../../services/favorites';
import { Card } from '../ui/Card';
import { formatDate } from '../../lib/utils/format';
import { Link } from 'react-router-dom';
import { tenderToContract, isContractFormat } from '../../lib/utils/tender-to-contract';
import type { Contract } from '../../types';

export function FavoritesList() {
  const { favorites, loading, error, refresh } = useFavorites();
  const [removing, setRemoving] = useState<string | null>(null);

  const handleRemove = async (contractId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cette annonce de vos favoris ?')) {
      return;
    }

    setRemoving(contractId);
    const result = await removeFavorite(contractId);

    if (result.success) {
      refresh();
    } else {
      alert(result.error || 'Erreur lors de la suppression');
    }

    setRemoving(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-peach-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-red-600">Erreur: {error}</p>
      </Card>
    );
  }

  if (favorites.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Star size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun favori</h3>
        <p className="text-gray-500">
          Ajoutez des annonces à vos favoris pour les retrouver facilement ici.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {favorites.map((favorite) => {
        const rawData = favorite.contractData;
        const contract: Contract = isContractFormat(rawData)
          ? rawData as Contract
          : tenderToContract(rawData as any);

        const buyerName = contract.contractingAuthority?.name || 'Acheteur non spécifié';
        const location = contract.location || contract.department;

        return (
          <Link
            key={favorite.id}
            to={`/contract/BOAMP/${contract.id}`}
            state={{ from: 'favorites' }}
            className="block"
          >
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-yellow-500 fill-current flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-peach-600 truncate">
                      {contract.title}
                    </h3>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Acheteur:</span>{' '}
                      {buyerName}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div>
                        <span className="font-medium">Publication:</span>{' '}
                        {formatDate(contract.publicationDate)}
                      </div>
                      <div>
                        <span className="font-medium">Date limite:</span>{' '}
                        {formatDate(contract.submissionDeadline)}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Ajouté le:</span>{' '}
                      {formatDate(new Date(favorite.createdAt))}
                    </div>
                  </div>

                  {location && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {location}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(contract.id);
                    }}
                    disabled={removing === contract.id}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Retirer des favoris"
                  >
                    {removing === contract.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 size={20} />
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
