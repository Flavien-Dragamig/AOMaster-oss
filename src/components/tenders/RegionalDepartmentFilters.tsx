import React, { useState, useMemo, useEffect } from 'react';
import { frenchDepartments, getUniqueRegions, getDepartmentsByRegion, Department } from '../../data/departments';
import { ChevronDown, ChevronRight, MapPin, Check, Square } from 'lucide-react';
import { FacetGroup } from '../../types/api';

interface RegionalDepartmentFiltersProps {
  selectedFacets: Record<string, string[]>;
  onFacetChange: (name: string, value: string, checked: boolean) => void;
  facetGroups?: FacetGroup[];
}

const RegionalDepartmentFilters: React.FC<RegionalDepartmentFiltersProps> = ({
  selectedFacets,
  onFacetChange,
  facetGroups
}) => {
  // State pour gérer les régions développées/réduites
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>({});
  
  // Récupérer toutes les régions uniques
  const uniqueRegions = useMemo(() => getUniqueRegions(), []);
  
  // Départements sélectionnés via les facettes
  const selectedDepartments = useMemo(() => {
    return selectedFacets['code_departement_prestation'] || [];
  }, [selectedFacets]);
  
  // Vérifier si une région est entièrement sélectionnée ou partiellement sélectionnée
  const getRegionSelectionStatus = (region: string): { selected: boolean, partial: boolean } => {
    const depts = getDepartmentsByRegion(region);
    const allDeptCodes = depts.map(d => d.code);
    
    // Vérifie si tous les départements de la région sont sélectionnés
    const allSelected = allDeptCodes.every(code => selectedDepartments.includes(code));
    
    // Vérifie si au moins un département de la région est sélectionné
    const someSelected = allDeptCodes.some(code => selectedDepartments.includes(code));
    
    return {
      selected: allSelected,
      partial: someSelected && !allSelected
    };
  };
  
  // Sélectionner ou désélectionner tous les départements d'une région
  const toggleRegionSelection = (region: string, expand = false) => {
    const depts = getDepartmentsByRegion(region);
    const regionStatus = getRegionSelectionStatus(region);
    
    // Si la région est entièrement sélectionnée, désélectionne tous les départements
    // Sinon, sélectionne tous les départements
    depts.forEach(dept => {
      onFacetChange('code_departement_prestation', dept.code, !regionStatus.selected);
    });
    
    // Optionnellement, ouvre la région pour montrer les départements sélectionnés
    if (expand) {
      setExpandedRegions(prev => ({
        ...prev,
        [region]: true
      }));
    }
  };
  
  // Toggle l'état de développement d'une région
  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };
  
  // Effet pour ouvrir automatiquement les régions qui ont des départements sélectionnés
  useEffect(() => {
    if (selectedDepartments.length > 0) {
      // Trouver les régions qui ont des départements sélectionnés
      const regionsWithSelectedDepts = uniqueRegions.filter(region => 
        getDepartmentsByRegion(region).some(dept => 
          selectedDepartments.includes(dept.code)
        )
      );
      
      // Ouvrir ces régions
      if (regionsWithSelectedDepts.length > 0) {
        setExpandedRegions(prev => {
          const newState = { ...prev };
          regionsWithSelectedDepts.forEach(region => {
            newState[region] = true;
          });
          return newState;
        });
      }
    }
  }, [selectedDepartments, uniqueRegions]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-4">
      <div className="flex items-center mb-4">
        <MapPin className="h-5 w-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">Localisation</h2>
      </div>
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
        {uniqueRegions.map((region) => {
          const isExpanded = expandedRegions[region] || false;
          const regionDepartments = getDepartmentsByRegion(region);
          const regionStatus = getRegionSelectionStatus(region);
          
          return (
            <div key={region} className="border-t border-gray-100 pt-2">
              {/* En-tête de région cliquable avec sélection */}
              <div className="flex items-center justify-between py-1 px-1 rounded">
                <div 
                  className="flex items-center cursor-pointer group flex-grow"
                  onClick={() => toggleRegionSelection(region, true)}
                >
                  <div className="relative flex items-center justify-center w-5 h-5 mr-1.5">
                    {regionStatus.selected ? (
                      <div className="bg-orange-500 rounded w-4 h-4 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : regionStatus.partial ? (
                      <div className="bg-orange-200 rounded w-4 h-4 flex items-center justify-center">
                        <div className="bg-orange-500 rounded-sm w-2 h-2"></div>
                      </div>
                    ) : (
                      <Square className="h-4 w-4 text-gray-400 group-hover:text-orange-400" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-700 group-hover:text-orange-600">{region}</h3>
                </div>
                
                <div 
                  className="cursor-pointer p-1 hover:bg-gray-50 rounded ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRegion(region);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              </div>
              
              {/* Départements de la région (conditionnellement affichés) */}
              {isExpanded && (
                <div className="pl-6 space-y-1 mt-1">
                  {regionDepartments.map((department) => (
                    <div key={department.code} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`dept-${department.code}`}
                        checked={selectedDepartments.includes(department.code)}
                        onChange={(e) => onFacetChange('code_departement_prestation', department.code, e.target.checked)}
                        className="h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                      />
                      <label 
                        htmlFor={`dept-${department.code}`} 
                        className="ml-2 text-sm text-gray-700 cursor-pointer flex-grow"
                      >
                        {department.code} - {department.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegionalDepartmentFilters;
