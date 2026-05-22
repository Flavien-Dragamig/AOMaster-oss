import React from 'react';
import { Bell, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';
import { Alert } from '../../types';

interface AlertListProps {
  onEdit?: (alert: Alert) => void;
}

/**
 * Composant affichant la liste des alertes de l'utilisateur
 * avec options de suppression et modification
 */
const AlertList: React.FC<AlertListProps> = ({ onEdit }) => {
  const { 
    alerts, 
    isLoading, 
    error, 
    deleteAlert, 
    deleteAlertMutation,
    testAlert 
  } = useAlerts();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-peach-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement des alertes</h3>
          </div>
        </div>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-12 bg-white shadow overflow-hidden sm:rounded-md">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune alerte</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par créer une nouvelle alerte pour suivre les marchés qui vous intéressent.
        </p>
      </div>
    );
  }

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) return;
    try {
      await deleteAlert(id);
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'alerte:', err);
      alert('Impossible de supprimer l\'alerte');
    }
  };

  const handleTestAlert = async (alert: Alert) => {
    try {
      const result = await testAlert(alert);
      alert(`Test réussi! ${result.message || 'L\'alerte fonctionne correctement.'}`);
    } catch (err) {
      console.error('Erreur lors du test de l\'alerte:', err);
      alert('Erreur lors du test de l\'alerte');
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {alerts.map((alert) => (
          <li key={alert.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-grow">
                <h3 className="text-lg font-medium text-gray-900">{alert.name}</h3>
                <div className="mt-2 space-y-1">
                  {alert.filters?.keywords?.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Mots-clés: {Array.isArray(alert.filters.keywords) 
                        ? alert.filters.keywords.join(', ') 
                        : alert.filters.keywords}
                    </p>
                  )}
                  {alert.filters?.departments?.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Départements: {alert.filters.departments.join(', ')}
                    </p>
                  )}
                  {alert.filters?.cpvCodes?.length > 0 && (
                    <p className="text-sm text-gray-500">
                      Codes CPV: {alert.filters.cpvCodes.join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Fréquence: {alert.frequency === 'daily' ? 'Quotidienne' : 'Hebdomadaire'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Dernière exécution: {alert.lastRun 
                      ? new Date(alert.lastRun).toLocaleDateString('fr-FR') 
                      : 'Jamais'}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3 items-center">
                <button
                  onClick={() => handleTestAlert(alert)}
                  className="text-gray-400 hover:text-blue-600"
                  title="Tester l'alerte"
                >
                  <Bell className="h-5 w-5" />
                </button>
                {onEdit && (
                  <button
                    onClick={() => onEdit(alert)}
                    className="text-gray-400 hover:text-peach-600"
                    title="Modifier l'alerte"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-gray-400 hover:text-red-600"
                  title="Supprimer l'alerte"
                  disabled={deleteAlertMutation.isPending}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AlertList;
