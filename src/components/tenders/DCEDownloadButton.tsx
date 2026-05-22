import { useState } from 'react';
import { Download, ExternalLink, XCircle, Loader2, Search } from 'lucide-react';
import { getDownloadUrl, getDCEButtonLabel } from '../../lib/utils/dce-download';
import { supabase } from '../../lib/supabase';
import { useTracking } from '../../contexts/TrackingContext';

interface DCEDownloadButtonProps {
  consultationUrl?: string;
  contractTitle?: string;
  contractData?: {
    reference?: string;
    buyerName?: string;
    announcementNumber?: string;
  };
}

export function DCEDownloadButton({ consultationUrl, contractTitle, contractData }: DCEDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<{ refConsultation: string; orgAcronyme: string } | null>(null);
  const { trackEvent } = useTracking();

  const downloadInfo = getDownloadUrl(consultationUrl, contractData);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    trackEvent('download_dce');

    try {
      if (downloadInfo.type === 'direct' && downloadInfo.url) {
        window.open(downloadInfo.url, '_blank');
      } else if (downloadInfo.type === 'search-place' && downloadInfo.searchData) {
        try {
          const { data, error: functionError } = await supabase.functions.invoke('search-place-dce', {
            body: downloadInfo.searchData,
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (functionError) {
            const searchUrl = `https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnounce&reference=${encodeURIComponent(downloadInfo.searchData.reference || downloadInfo.searchData.announcementNumber || '')}`;
            setError(`Recherche automatique indisponible. Ouvrez le lien de recherche PLACE ci-dessous pour accéder manuellement au DCE.`);
            window.open(searchUrl, '_blank');
            return;
          }

          if (data && data.success) {
            setSearchResult({
              refConsultation: data.refConsultation,
              orgAcronyme: data.orgAcronyme
            });

            const response = await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-dce`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  refConsultation: data.refConsultation,
                  orgAcronyme: data.orgAcronyme
                })
              }
            );

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.error || 'Erreur lors du téléchargement');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DCE_${contractTitle || 'document'}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          } else {
            const searchUrl = data?.searchUrl || `https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnounce&reference=${encodeURIComponent(downloadInfo.searchData.reference || downloadInfo.searchData.announcementNumber || '')}`;
            setError('Consultation non trouvée automatiquement. Ouvrez le lien de recherche PLACE ci-dessous.');
            window.open(searchUrl, '_blank');
          }
        } catch (err) {
          const searchUrl = `https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnounce&reference=${encodeURIComponent(downloadInfo.searchData.reference || downloadInfo.searchData.announcementNumber || '')}`;
          setError('Erreur lors de la recherche automatique. Ouvrez le lien de recherche PLACE ci-dessous.');
          window.open(searchUrl, '_blank');
          throw err;
        }
      } else if (downloadInfo.type === 'place' && downloadInfo.refConsultation && downloadInfo.orgAcronyme) {
        const { data, error: functionError } = await supabase.functions.invoke('download-dce', {
          body: {
            refConsultation: downloadInfo.refConsultation,
            orgAcronyme: downloadInfo.orgAcronyme
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (functionError) {
          throw new Error(functionError.message || 'Erreur lors du téléchargement');
        }

        if (data instanceof Blob) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = `DCE_${contractTitle || 'document'}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        } else {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-dce`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refConsultation: downloadInfo.refConsultation,
                orgAcronyme: downloadInfo.orgAcronyme
              })
            }
          );

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Erreur lors du téléchargement');
          }

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `DCE_${contractTitle || 'document'}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    } catch (err) {
      console.error('Erreur de téléchargement:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du téléchargement');
    } finally {
      setLoading(false);
    }
  };

  if (downloadInfo.type === 'unavailable') {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed"
        title="Dossier de consultation non disponible"
      >
        <XCircle size={20} />
        <span className="font-medium">{getDCEButtonLabel(downloadInfo.type)}</span>
      </button>
    );
  }

  const Icon = downloadInfo.type === 'direct'
    ? Download
    : downloadInfo.type === 'search-place'
      ? Search
      : ExternalLink;

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
          transition-all duration-200
          ${downloadInfo.type === 'direct'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : downloadInfo.type === 'search-place'
            ? 'bg-orange-600 hover:bg-orange-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${downloadInfo.type === 'direct'
            ? 'focus:ring-green-500'
            : downloadInfo.type === 'search-place'
            ? 'focus:ring-orange-500'
            : 'focus:ring-blue-500'
          }
        `}
        title={downloadInfo.type === 'direct'
          ? 'Téléchargement direct depuis le cloud'
          : downloadInfo.type === 'search-place'
          ? 'Rechercher et télécharger via PLACE'
          : 'Télécharger via la plateforme PLACE'}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Chargement...</span>
          </>
        ) : (
          <>
            <Icon size={20} />
            <span>{getDCEButtonLabel(downloadInfo.type)}</span>
          </>
        )}
      </button>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {(downloadInfo.type === 'place' || downloadInfo.type === 'search-place') && !loading && (
        <p className="text-xs text-gray-500">
          {downloadInfo.type === 'search-place'
            ? 'Recherche automatique sur PLACE puis téléchargement (peut prendre 10-20 secondes)'
            : 'Le téléchargement peut prendre quelques secondes'}
        </p>
      )}

      {downloadInfo.type === 'search-place' && downloadInfo.searchData && !loading && (
        <a
          href={`https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseAdvancedSearch&searchAnnounce&reference=${encodeURIComponent(downloadInfo.searchData.reference || downloadInfo.searchData.announcementNumber || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Ou rechercher manuellement sur PLACE
        </a>
      )}

      {searchResult && (
        <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
          Consultation trouvée: {searchResult.refConsultation}
        </div>
      )}
    </div>
  );
}
