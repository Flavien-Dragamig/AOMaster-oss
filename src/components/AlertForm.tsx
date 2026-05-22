import React, { useState } from 'react';
import { Bell, Save, X } from 'lucide-react';
import DepartmentFilter from './DepartmentFilter';
import { useTracking } from '../contexts/TrackingContext';
import { Alert } from '../types';

interface AlertFormProps {
  onSubmit: (alert: Omit<Alert, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'lastRun'>) => Promise<void>;
  onCancel: () => void;
}

const AlertForm: React.FC<AlertFormProps> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [cpvCodes, setCpvCodes] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        name,
        keywords,
        cpvCodes,
        departments,
        frequency
      });
      trackEvent('create_alert');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const keywordsList = value.split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    setKeywords(keywordsList);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Bell className="mr-2 text-peach-500" size={24} />
          Nouvelle Alerte
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={24} />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom de l'alerte
          </label>
          <input
            type="text"
            id="name"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-peach-500 focus:ring-peach-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marchés informatiques Île-de-France"
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
            Mots-clés (séparés par des virgules)
          </label>
          <textarea
            id="keywords"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-peach-500 focus:ring-peach-500"
            value={keywords.join(', ')}
            onChange={handleKeywordsChange}
            placeholder="Ex: développement web, application mobile, maintenance"
          />
        </div>

        <div>
          <label htmlFor="cpv" className="block text-sm font-medium text-gray-700">
            Codes CPV (séparés par des virgules)
          </label>
          <input
            type="text"
            id="cpv"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-peach-500 focus:ring-peach-500"
            value={cpvCodes.join(', ')}
            onChange={(e) => setCpvCodes(e.target.value.split(',').map(c => c.trim()).filter(c => c))}
            placeholder="Ex: 72000000, 72100000"
          />
        </div>

        <div>
          <DepartmentFilter
            selectedDepartments={departments}
            onChange={setDepartments}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fréquence des alertes
          </label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-peach-500 focus:ring-peach-500"
                name="frequency"
                value="daily"
                checked={frequency === 'daily'}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
              />
              <span className="ml-2">Quotidienne</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-peach-500 focus:ring-peach-500"
                name="frequency"
                value="weekly"
                checked={frequency === 'weekly'}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
              />
              <span className="ml-2">Hebdomadaire</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 disabled:opacity-50"
        >
          <div className="flex items-center">
            <Save size={16} className="mr-2" />
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </div>
        </button>
      </div>
    </form>
  );
};

export default AlertForm;