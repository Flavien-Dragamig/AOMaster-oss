import React, { useState } from 'react';
import { Bell, Plus, AlertTriangle } from 'lucide-react';
import AlertForm from '../components/AlertForm';
import AlertList from '../components/alerts/AlertList';
import { Alert, AlertInput } from '../hooks/useAlerts';
import { useAlerts } from '../hooks/useAlerts';
import { useAuth } from '../hooks/useAuth';

const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const { alerts, isLoading, error, createAlert, refreshAlerts, getAlertStats } = useAlerts();
  const [showForm, setShowForm] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null);

  const stats = getAlertStats();

  const handleCreateAlert = async (alertData: AlertInput) => {
    try {
      await createAlert(alertData);
      setShowForm(false);
      setStatusMessage({
        type: 'success',
        text: 'Alerte créée avec succès !'
      });
      // Le hook useAlerts rafraîchit automatiquement les données
    } catch (err) {
      console.error('Erreur lors de la création de l\'alerte:', err);
      setStatusMessage({
        type: 'error',
        text: 'Impossible de créer l\'alerte'
      });
    }
  };
  
  const handleEditAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setShowForm(true);
  };

  // Ce loading est géré directement dans le composant AlertList

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Alertes</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Alerte
        </button>
      </div>

      {statusMessage && (
        <div className={`${statusMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-md p-4 mb-6`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {statusMessage.type === 'success' ? (
                <Bell className="h-5 w-5 text-green-400" aria-hidden="true" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${statusMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {statusMessage.text}
              </h3>
            </div>
          </div>
        </div>
      )}

      {showForm ? (
        <AlertForm
          onSubmit={handleCreateAlert}
          onCancel={() => {
            setShowForm(false);
            setSelectedAlert(null);
          }}
          // Ajouter support pour la modification d'une alerte existante si nécessaire
        />
      ) : (
        <div className="space-y-8">
          {/* Dashboard des alertes */}
          {alerts && alerts.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-peach-100 rounded-md p-3">
                      <Bell className="h-6 w-6 text-peach-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total d'alertes</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.total}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <Bell className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Correspondances (semaine)</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.matchesLastWeek}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Correspondances (mois)</dt>
                        <dd className="text-lg font-semibold text-gray-900">{stats.matchesLastMonth}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Liste des alertes */}
          <AlertList onEdit={handleEditAlert} />
        </div>
      )}
    </div>
  );
};

export default AlertsPage;