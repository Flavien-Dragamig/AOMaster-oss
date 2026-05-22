import React from 'react';
import { FacetGroup, FacetValue } from '../../types/api';
import { Filter } from 'lucide-react';

interface DynamicFiltersProps {
  facetGroups: FacetGroup[];
  onFilterChange: (name: string, value: string, selected: boolean) => void;
}

/**
 * Composant affichant les filtres dynamiques générés à partir des facettes renvoyées par l'API
 */
const DynamicFilters: React.FC<DynamicFiltersProps> = ({ facetGroups, onFilterChange }) => {
  // Ne pas afficher si aucun groupe de facettes n'est disponible
  if (!facetGroups || facetGroups.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-4">
      <div className="flex items-center mb-4">
        <Filter className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Filtres disponibles</h2>
      </div>
      
      <div className="space-y-4">
        {facetGroups.map((facetGroup) => (
          <div key={facetGroup.name} className="border-t border-gray-100 pt-3">
            <h3 className="font-medium text-gray-700 mb-2">{facetGroup.label}</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {facetGroup.values.map((facet) => (
                <div key={facet.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`${facetGroup.name}-${facet.value}`}
                    checked={facet.selected}
                    onChange={(e) => onFilterChange(facetGroup.name, facet.value, e.target.checked)}
                    className="h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label 
                    htmlFor={`${facetGroup.name}-${facet.value}`} 
                    className="ml-2 text-sm text-gray-700 cursor-pointer flex-grow"
                  >
                    {facet.value}
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {facet.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DynamicFilters;
