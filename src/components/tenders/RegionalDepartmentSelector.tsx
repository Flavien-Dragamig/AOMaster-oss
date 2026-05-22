import React from 'react';
import { frenchDepartments, getUniqueRegions, getDepartmentsByRegion } from '../../data/departments';

interface RegionalDepartmentSelectorProps {
  selectedFacets: Record<string, string[]>;
  onFacetChange: (name: string, value: string, checked: boolean) => void;
}

const RegionalDepartmentSelector: React.FC<RegionalDepartmentSelectorProps> = ({
  selectedFacets,
  onFacetChange
}) => {
  const regionNames = getUniqueRegions();

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    onFacetChange(name, value, checked);
  };

  const handleRegionCheckboxChange = (regionName: string, checked: boolean) => {
    const departments = getDepartmentsByRegion(regionName);

    departments.forEach(dept => {
      onFacetChange('code_departement_prestation', dept.code, checked);
    });
  };

  const isRegionFullySelected = (regionName: string): boolean => {
    const departments = getDepartmentsByRegion(regionName);
    if (!selectedFacets.code_departement_prestation || selectedFacets.code_departement_prestation.length === 0) {
      return false;
    }
    return departments.every(dept => selectedFacets.code_departement_prestation?.includes(dept.code));
  };

  return (
    <div className="space-y-4">
      {regionNames.map(regionName => {
        const departments = getDepartmentsByRegion(regionName);
        const isFullySelected = isRegionFullySelected(regionName);

        return (
          <div key={regionName} className="border rounded-md p-4">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id={`region-${regionName}`}
                checked={isFullySelected}
                onChange={(e) => handleRegionCheckboxChange(regionName, e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor={`region-${regionName}`} className="font-medium">
                {regionName} (tous les départements)
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-4">
              {departments.map(dept => (
                <div key={dept.code} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`dept-${dept.code}`}
                    name="code_departement_prestation"
                    value={dept.code}
                    checked={selectedFacets.code_departement_prestation?.includes(dept.code) || false}
                    onChange={handleCheckboxChange}
                    className="mr-2 h-4 w-4"
                  />
                  <label htmlFor={`dept-${dept.code}`} className="text-sm">
                    {dept.code} - {dept.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RegionalDepartmentSelector;
