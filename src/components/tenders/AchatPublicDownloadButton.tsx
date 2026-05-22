import { useState } from 'react';
import { Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { fetchAchatPublicRC, openAchatPublicPage } from '../../lib/utils/achatpublic';

interface AchatPublicDownloadButtonProps {
  url: string;
  className?: string;
}

export function AchatPublicDownloadButton({ url, className = '' }: AchatPublicDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchAchatPublicRC(url);

      if (result.success && result.rcUrl) {
        window.open(result.rcUrl, '_blank', 'noopener,noreferrer');
      } else if (result.pageUrl) {
        setError(result.error || 'Lien RC non trouvé');
        setTimeout(() => {
          if (confirm(
            'Le lien direct du règlement de consultation n\'a pas pu être trouvé.\n\n' +
            'Voulez-vous ouvrir la page AchatPublic pour télécharger manuellement ?'
          )) {
            openAchatPublicPage(url);
          }
        }, 100);
      } else {
        setError(result.error || 'Erreur inconnue');
      }
    } catch (err) {
      console.error('Error downloading RC:', err);
      setError('Erreur lors de la récupération du lien');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPage = () => {
    openAchatPublicPage(url);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        <Button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Recherche du lien...
            </>
          ) : (
            <>
              <Download size={16} />
              Télécharger RC (AchatPublic)
            </>
          )}
        </Button>

        <Button
          onClick={handleOpenPage}
          variant="secondary"
          className="flex items-center gap-2"
          title="Ouvrir la page AchatPublic"
        >
          <ExternalLink size={16} />
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
