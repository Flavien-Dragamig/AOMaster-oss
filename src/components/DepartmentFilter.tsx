import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface Department {
  code: string;
  name: string;
}

const DEPARTMENTS: Department[] = [
  { code: '01', name: 'Ain' },
  { code: '02', name: 'Aisne' },
  { code: '03', name: 'Allier' },
  { code: '04', name: 'Alpes-de-Haute-Provence' },
  { code: '05', name: 'Hautes-Alpes' },
  { code: '06', name: 'Alpes-Maritimes' },
  { code: '07', name: 'Ardèche' },
  { code: '08', name: 'Ardennes' },
  { code: '09', name: 'Ariège' },
  { code: '10', name: 'Aube' },
  { code: '11', name: 'Aude' },
  { code: '12', name: 'Aveyron' },
  { code: '13', name: 'Bouches-du-Rhône' },
  { code: '14', name: 'Calvados' },
  { code: '15', name: 'Cantal' },
  { code: '16', name: 'Charente' },
  { code: '17', name: 'Charente-Maritime' },
  { code: '18', name: 'Cher' },
  { code: '19', name: 'Corrèze' },
  { code: '21', name: 'Côte-d\'Or' },
  { code: '22', name: 'Côtes-d\'Armor' },
  { code: '23', name: 'Creuse' },
  { code: '24', name: 'Dordogne' },
  { code: '25', name: 'Doubs' },
  { code: '26', name: 'Drôme' },
  { code: '27', name: 'Eure' },
  { code: '28', name: 'Eure-et-Loir' },
  { code: '29', name: 'Finistère' },
  { code: '2A', name: 'Corse-du-Sud' },
  { code: '2B', name: 'Haute-Corse' },
  { code: '30', name: 'Gard' },
  { code: '31', name: 'Haute-Garonne' },
  { code: '32', name: 'Gers' },
  { code: '33', name: 'Gironde' },
  { code: '34', name: 'Hérault' },
  { code: '35', name: 'Ille-et-Vilaine' },
  { code: '36', name: 'Indre' },
  { code: '37', name: 'Indre-et-Loire' },
  { code: '38', name: 'Isère' },
  { code: '39', name: 'Jura' },
  { code: '40', name: 'Landes' },
  { code: '41', name: 'Loir-et-Cher' },
  { code: '42', name: 'Loire' },
  { code: '43', name: 'Haute-Loire' },
  { code: '44', name: 'Loire-Atlantique' },
  { code: '45', name: 'Loiret' },
  { code: '46', name: 'Lot' },
  { code: '47', name: 'Lot-et-Garonne' },
  { code: '48', name: 'Lozère' },
  { code: '49', name: 'Maine-et-Loire' },
  { code: '50', name: 'Manche' },
  { code: '51', name: 'Marne' },
  { code: '52', name: 'Haute-Marne' },
  { code: '53', name: 'Mayenne' },
  { code: '54', name: 'Meurthe-et-Moselle' },
  { code: '55', name: 'Meuse' },
  { code: '56', name: 'Morbihan' },
  { code: '57', name: 'Moselle' },
  { code: '58', name: 'Nièvre' },
  { code: '59', name: 'Nord' },
  { code: '60', name: 'Oise' },
  { code: '61', name: 'Orne' },
  { code: '62', name: 'Pas-de-Calais' },
  { code: '63', name: 'Puy-de-Dôme' },
  { code: '64', name: 'Pyrénées-Atlantiques' },
  { code: '65', name: 'Hautes-Pyrénées' },
  { code: '66', name: 'Pyrénées-Orientales' },
  { code: '67', name: 'Bas-Rhin' },
  { code: '68', name: 'Haut-Rhin' },
  { code: '69', name: 'Rhône' },
  { code: '70', name: 'Haute-Saône' },
  { code: '71', name: 'Saône-et-Loire' },
  { code: '72', name: 'Sarthe' },
  { code: '73', name: 'Savoie' },
  { code: '74', name: 'Haute-Savoie' },
  { code: '75', name: 'Paris' },
  { code: '76', name: 'Seine-Maritime' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '78', name: 'Yvelines' },
  { code: '79', name: 'Deux-Sèvres' },
  { code: '80', name: 'Somme' },
  { code: '81', name: 'Tarn' },
  { code: '82', name: 'Tarn-et-Garonne' },
  { code: '83', name: 'Var' },
  { code: '84', name: 'Vaucluse' },
  { code: '85', name: 'Vendée' },
  { code: '86', name: 'Vienne' },
  { code: '87', name: 'Haute-Vienne' },
  { code: '88', name: 'Vosges' },
  { code: '89', name: 'Yonne' },
  { code: '90', name: 'Territoire de Belfort' },
  { code: '91', name: 'Essonne' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '95', name: 'Val-d\'Oise' }
];

interface DepartmentFilterProps {
  selectedDepartments: string[];
  onChange: (departments: string[]) => void;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  selectedDepartments,
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredDepartments = DEPARTMENTS.filter(dept =>
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDepartment = (code: string) => {
    const newSelection = selectedDepartments.includes(code)
      ? selectedDepartments.filter(d => d !== code)
      : [...selectedDepartments, code];
    onChange(newSelection);
  };

  const clearSelection = () => {
    onChange([]);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Départements
        </label>
        {selectedDepartments.length > 0 && (
          <button
            type="button"
            onClick={clearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <X size={14} className="mr-1" />
            Effacer ({selectedDepartments.length})
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-peach-300 focus:border-peach-300"
          placeholder="Rechercher un département..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 space-y-1">
            {filteredDepartments.map((dept) => (
              <label
                key={dept.code}
                className="flex items-center px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-peach-500 focus:ring-peach-500"
                  checked={selectedDepartments.includes(dept.code)}
                  onChange={() => toggleDepartment(dept.code)}
                />
                <span className="ml-2 text-sm text-gray-900">
                  {dept.code} - {dept.name}
                </span>
              </label>
            ))}
            {filteredDepartments.length === 0 && (
              <div className="px-2 py-1 text-sm text-gray-500">
                Aucun département trouvé
              </div>
            )}
          </div>
        </div>
      )}

      {selectedDepartments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedDepartments.map(code => {
            const dept = DEPARTMENTS.find(d => d.code === code);
            return (
              <span
                key={code}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-peach-100 text-peach-800"
              >
                {dept?.code} - {dept?.name}
                <button
                  type="button"
                  onClick={() => toggleDepartment(code)}
                  className="ml-1 text-peach-600 hover:text-peach-800"
                >
                  <X size={14} />
                </button>
              </span>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default DepartmentFilter;