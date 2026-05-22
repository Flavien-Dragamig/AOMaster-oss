import React, { useState, useEffect } from 'react';
import type { SearchFilters } from '../../types';
import { Search } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useDebounce } from '../../hooks/useDebounce';

interface TenderSearchFormProps {
  onSearch: (criteria: SearchFilters) => void;
  isSearching: boolean;
  initialCriteria: SearchFilters;
}

const TenderSearchForm: React.FC<TenderSearchFormProps> = ({ onSearch, isSearching, initialCriteria }) => {
  const [criteria, setCriteria] = useState<SearchFilters>(initialCriteria);
  const [, setSavedSearchParams] = useLocalStorage<SearchFilters>('lastSearchParams', {});
  const debouncedCriteria = useDebounce(criteria, 500);

  useEffect(() => {
    setCriteria(initialCriteria);
  }, [initialCriteria]);

  useEffect(() => {
    setSavedSearchParams(debouncedCriteria);
  }, [debouncedCriteria, setSavedSearchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newCriteria = {
      ...criteria,
      [name]: type === 'checkbox' ? checked : value
    };
    setCriteria(newCriteria);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedSearchParams(criteria);
    onSearch(criteria);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Filtres de recherche</h2>
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="keywords"
              value={criteria.keywords || (criteria.query ? (Array.isArray(criteria.query) ? criteria.query.join(' ') : criteria.query) : '')}
              onChange={handleInputChange}
              placeholder="Rechercher des marchés (ex: direction artistique, gestion de projet)"
              className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSearching}
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 disabled:bg-gray-400 transition-colors"
              disabled={isSearching}
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="extendedSearch"
              name="extendedSearch"
              checked={criteria.extendedSearch || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              disabled={isSearching}
            />
            <label htmlFor="extendedSearch" className="ml-2 text-sm text-gray-700">
              Recherche élargie (rechercher aussi dans les champs complémentaires)
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TenderSearchForm;
