import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTracking } from '../../contexts/TrackingContext';
import { Loader2, Save, CheckCircle, AlertCircle, BarChart3, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { ConversionEvent } from '../../types/tracking';
import type { Json } from '../../types/database';

const AdminTrackingPage: React.FC = () => {
  const { refreshConfig } = useTracking();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [conversionId, setConversionId] = useState('');
  const [events, setEvents] = useState<ConversionEvent[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('tracking_config')
        .select('*')
        .eq('id', 'singleton')
        .single();

      if (error) throw error;

      if (data) {
        setEnabled(data.enabled);
        setConversionId(data.conversion_id || '');
        setEvents((data.conversion_events as unknown as ConversionEvent[]) || []);
        setUpdatedAt(data.updated_at);
      }
    } catch (err) {
      console.error('Error fetching tracking config:', err);
      setError('Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('tracking_config')
        .update({
          enabled,
          conversion_id: conversionId.trim(),
          conversion_events: events as unknown as Json,
          updated_by: user?.id ?? null,
        })
        .eq('id', 'singleton');

      if (error) throw error;

      await refreshConfig();
      setSuccess(true);
      setUpdatedAt(new Date().toISOString());
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving tracking config:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateEventLabel = (index: number, label: string) => {
    setEvents((prev) =>
      prev.map((e, i) => (i === index ? { ...e, label } : e))
    );
  };

  const toggleEventActive = (index: number) => {
    setEvents((prev) =>
      prev.map((e, i) => (i === index ? { ...e, active: !e.active } : e))
    );
  };

  const activeEventsCount = events.filter((e) => e.active && e.label).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Suivi Google Ads</h1>
        <p className="text-gray-600 mt-2">
          Configurez le suivi des conversions Google Ads pour mesurer l'efficacité de vos campagnes.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-sm text-green-700">Configuration sauvegardée avec succès.</p>
        </div>
      )}

      {/* Section 1 : Configuration globale */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration globale</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Activer le suivi Google Ads</label>
              <p className="text-xs text-gray-500 mt-1">
                Active le chargement du script gtag.js et le suivi des conversions pour tous les visiteurs.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {enabled ? 'Actif' : 'Inactif'}
              </span>
              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enabled ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="conversionId" className="block text-sm font-medium text-gray-700">
              ID de conversion Google Ads
            </label>
            <input
              id="conversionId"
              type="text"
              placeholder="AW-XXXXXXXXX"
              value={conversionId}
              onChange={(e) => setConversionId(e.target.value)}
              className="mt-1 block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Trouvez votre ID dans Google Ads &gt; Outils &gt; Conversions
            </p>
          </div>
        </div>
      </div>

      {/* Section 2 : Événements de conversion */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Événements de conversion</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configurez les labels de conversion pour chaque type d'événement. Laissez le label vide pour ne pas tracker un événement.
          </p>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Événement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Label de conversion
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actif
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event, index) => (
              <tr key={event.event_name} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                    {event.event_name}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {event.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="text"
                    placeholder="AbC-dEf_gHi"
                    value={event.label}
                    onChange={(e) => updateEventLabel(index, e.target.value)}
                    className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => toggleEventActive(index)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      event.active ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        event.active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 3 : Aperçu */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Eye className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Aperçu de la configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Statut</p>
            <p className={`text-lg font-semibold ${enabled ? 'text-green-600' : 'text-gray-500'}`}>
              {enabled ? 'Tracking actif' : 'Tracking désactivé'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">ID de conversion</p>
            <p className="text-lg font-semibold text-gray-900">
              {conversionId || '—'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500">Événements actifs</p>
            <p className="text-lg font-semibold text-gray-900">
              {activeEventsCount} / {events.length}
            </p>
          </div>
        </div>

        {activeEventsCount > 0 && conversionId && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Événements suivis :</p>
            <div className="flex flex-wrap gap-2">
              {events
                .filter((e) => e.active && e.label)
                .map((e) => (
                  <span
                    key={e.event_name}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                  >
                    {e.description}
                  </span>
                ))}
            </div>
          </div>
        )}

        {updatedAt && (
          <p className="text-xs text-gray-400 mt-4">
            Dernière modification : {format(new Date(updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
        )}
      </div>

      {/* Bouton Sauvegarder */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Save className="h-5 w-5" />
          )}
          <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
        </button>
      </div>
    </div>
  );
};

export default AdminTrackingPage;
