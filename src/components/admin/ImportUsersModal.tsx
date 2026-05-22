import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUsersImported: () => void;
}

interface ImportResult {
  email: string;
  password: string;
  userId: string;
}

interface ImportError {
  email: string;
  error: string;
}

export const ImportUsersModal: React.FC<ImportUsersModalProps> = ({ isOpen, onClose, onUsersImported }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Le fichier doit être au format CSV');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const parseCSV = (text: string): Array<{ email: string; displayName?: string; isAdmin?: boolean }> => {
    const lines = text.split('\n').filter(line => line.trim());
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const email = values[0];
      const displayName = values[1] || undefined;
      const isAdmin = values[2]?.toLowerCase() === 'true' || values[2] === '1';

      if (email && email.includes('@')) {
        users.push({ email, displayName, isAdmin });
      }
    }

    return users;
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const users = parseCSV(text);

      if (users.length === 0) {
        throw new Error('Aucun utilisateur valide trouvé dans le fichier CSV');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-users`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ users }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import users');
      }

      setResults(result.results || []);
      setErrors(result.errors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import users');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = 'email,displayName,isAdmin\nexample@domain.com,John Doe,false\nadmin@domain.com,Admin User,true';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadResults = () => {
    if (!results) return;

    const csvContent = 'email,password\n' + results.map(r => `${r.email},${r.password}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-credentials.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (results && results.length > 0) {
      onUsersImported();
    }
    setFile(null);
    setError(null);
    setResults(null);
    setErrors([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">Importer des utilisateurs</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {!results ? (
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Format du fichier CSV</h3>
              <p className="text-sm text-blue-800 mb-3">
                Le fichier doit contenir les colonnes suivantes: email, displayName, isAdmin
              </p>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Télécharger le modèle CSV</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier CSV
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    {file ? file.name : 'Cliquez pour sélectionner un fichier CSV'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Format: email, displayName, isAdmin
                  </p>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Upload className="h-5 w-5" />
                <span>{loading ? 'Import en cours...' : 'Importer'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">
                {results.length} utilisateur(s) créé(s) avec succès
              </p>
              {errors.length > 0 && (
                <p className="text-yellow-700 text-sm mt-1">
                  {errors.length} erreur(s) rencontrée(s)
                </p>
              )}
            </div>

            {results.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Utilisateurs créés</h3>
                  <button
                    onClick={downloadResults}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger les identifiants</span>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mot de passe</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.map((result, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">{result.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 font-mono">{result.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span>Erreurs</span>
                </h3>
                <div className="max-h-40 overflow-y-auto border border-red-200 rounded-lg bg-red-50">
                  <table className="min-w-full divide-y divide-red-200">
                    <thead className="bg-red-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-700 uppercase">Erreur</th>
                      </tr>
                    </thead>
                    <tbody className="bg-red-50 divide-y divide-red-200">
                      {errors.map((error, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-red-900">{error.email}</td>
                          <td className="px-4 py-3 text-sm text-red-700">{error.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Téléchargez les identifiants maintenant. Ils ne seront plus accessibles après la fermeture de cette fenêtre.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
