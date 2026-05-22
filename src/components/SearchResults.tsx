import React from 'react';
import { Contract } from '../types';
import { AlertCircle, Building, Calendar, MapPin, ExternalLink, Euro } from 'lucide-react';
import { format } from 'date-fns';

interface SearchResultsProps {
  results: Contract[] | null;
  loading: boolean;
  error: string | null;
  onSaveContract: (contractId: string) => void;
  onSetAlert: (contractId: string) => void;
  onViewDetails: (id: string, source: 'BOAMP' | 'TED') => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  loading,
  error,
  onViewDetails
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-peach-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
        <div className="flex items-start">
          <AlertCircle className="text-red-500 mt-0.5 mr-3" size={18} />
          <div>
            <h3 className="font-medium text-red-800">Erreur lors du chargement des résultats</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 my-4 text-center">
        <h3 className="font-medium text-gray-800 mb-2">Utilisez les filtres ci-dessus pour rechercher des marchés</h3>
        <p className="text-sm text-gray-600">
          Les résultats s'afficheront ici une fois la recherche lancée.
        </p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 my-4 text-center">
        <h3 className="font-medium text-gray-800 mb-2">Aucun marché trouvé</h3>
        <p className="text-sm text-gray-600">
          Essayez d'ajuster vos critères de recherche pour trouver plus de résultats.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">      
      <div className="space-y-4">
        {results.map((contract) => (
          <div 
            key={contract.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    contract.status === 'open' 
                      ? 'bg-green-100 text-green-800' 
                      : contract.status === 'awarded'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {contract.status === 'open' ? 'Ouvert' : contract.status === 'awarded' ? 'Attribué' : 'Fermé'}
                  </span>
                  <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full">
                    {contract.source}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-peach-600 cursor-pointer"
                  onClick={() => onViewDetails(contract.id, contract.source)}>
                {contract.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {contract.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building size={16} className="mr-2 text-gray-400" />
                  <span className="line-clamp-1">{contract.contractingAuthority.name}</span>
                </div>

                {contract.estimatedValue && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Euro size={16} className="mr-2 text-gray-400" />
                    <span>
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: contract.estimatedValue.currency
                      }).format(contract.estimatedValue.amount)}
                    </span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  <span>{contract.location}</span>
                  {contract.department && ` (${contract.department})`}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="text-gray-600 flex items-center">
                  <Calendar size={16} className="mr-1 text-gray-400" />
                  <span>Publié le : {contract.publicationDate.toLocaleDateString('fr-FR')}</span>
                </div>

                <div className="text-gray-600 font-medium flex items-center">
                  <Calendar size={16} className="mr-1 text-gray-400" />
                  <span>Date limite : {contract.submissionDeadline.toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <button 
                  className="text-sm text-peach-600 hover:text-peach-800 flex items-center transition-colors duration-200"
                  onClick={() => onViewDetails(contract.id, contract.source)}
                >
                  <ExternalLink size={16} className="mr-1" />
                  Voir les détails
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
