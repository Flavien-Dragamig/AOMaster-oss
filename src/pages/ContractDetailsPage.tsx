import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import type { Contract } from '../types';
import { getContractDetails } from '../services/api';
import {
  Calendar,
  MapPin,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  Briefcase,
  Phone,
  Mail,
  Globe,
  User,
  Building2,
  FileText,
  Euro,
} from 'lucide-react';
import { FavoriteButton } from '../components/favorites/FavoriteButton';
import { DCEDownloadButton } from '../components/tenders/DCEDownloadButton';
import { AchatPublicDownloadButton } from '../components/tenders/AchatPublicDownloadButton';
import { isAchatPublicUrl } from '../lib/utils/achatpublic';
import { getPlatformLink } from '../lib/utils/dce-download';
import { useTracking } from '../contexts/TrackingContext';

const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { trackEvent } = useTracking();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const state = location.state as { searchParams?: string; from?: string } | null;
  const searchParams = state?.searchParams || '';
  const comingFrom = state?.from;

  const backUrl = comingFrom === 'favorites' ? '/settings/favorites' : `/search${searchParams}`;
  const backLabel = comingFrom === 'favorites' ? 'Retour à mes favoris' : 'Retour aux résultats de recherche';

  useEffect(() => {
    if (!id) {
      setError('Aucun identifiant de contrat fourni.');
      setLoading(false);
      return;
    }

    const fetchContract = async () => {
      try {
        setLoading(true);
        // The source is hardcoded to BOAMP for now
        const fetchedContract = await getContractDetails(id, 'BOAMP');
        setContract(fetchedContract);
        trackEvent('view_contract');
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue s\'est produite';
        setError(`Impossible de récupérer les détails du contrat : ${errorMessage}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status: Contract['status']) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'awarded':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Contract['status']) => {
    switch (status) {
      case 'open':
        return 'Ouvert';
      case 'awarded':
        return 'Attribué';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p>Chargement des détails du contrat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 text-center">
          <AlertCircle className="text-red-500 h-12 w-12 mx-auto mb-4" />
          <h3 className="font-medium text-red-800">Erreur</h3>
          <p className="text-sm text-red-700 mt-2">{error}</p>
          <Link
            to={backUrl}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
          >
            <ArrowLeft size={16} className="mr-2" />
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4 text-center">
          <AlertCircle className="text-yellow-500 h-12 w-12 mx-auto mb-4" />
          <h3 className="font-medium text-yellow-800">Détails du contrat non disponibles</h3>
          <Link
            to={backUrl}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-peach-600 hover:bg-peach-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500"
          >
            <ArrowLeft size={16} className="mr-2" />
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  const sourceUrl = contract.documentUrls.length > 0 ? contract.documentUrls[0] : null;
  const platformLink = getPlatformLink(contract.marketDocumentsUrl, contract.contractingAuthority.profileUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={backUrl} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-peach-600 mb-6">
        <ArrowLeft size={16} className="mr-1" />
        {backLabel}
      </Link>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(contract.status)}`}>
                {getStatusLabel(contract.status)}
              </span>
              <FavoriteButton contract={contract} size="md" showLabel />
            </div>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-peach-600 hover:text-peach-800 text-sm"
              >
                Voir la publication originale
                <ExternalLink size={14} className="ml-1" />
              </a>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{contract.title}</h1>
          <p className="text-sm text-gray-500 mb-4">par {contract.contractingAuthority.name}</p>

          <div className="flex items-center text-sm text-gray-500 mb-6 space-x-4 flex-wrap">
             <div className="flex items-center mt-2">
              <Briefcase size={16} className="mr-1.5" />
              <span>{contract.contractType.charAt(0).toUpperCase() + contract.contractType.slice(1)}</span>
            </div>
            <div className="flex items-center mt-2">
              <MapPin size={16} className="mr-1.5" />
              <span>{contract.location} (Dép : {contract.department || 'N/D'})</span>
            </div>
            <div className="flex items-center mt-2">
              <Calendar size={16} className="mr-1.5" />
              <span>Publié : {formatDate(contract.publicationDate)}</span>
            </div>
            {contract.submissionDeadline && (
              <div className="flex items-center font-medium text-red-600 mt-2">
                <Calendar size={16} className="mr-1.5" />
                <span>Clôture : {formatDate(contract.submissionDeadline)}</span>
              </div>
            )}
          </div>

          <div className="prose max-w-none text-gray-700 mt-6">
            <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">Description</h3>
            <p>{contract.description}</p>
          </div>

          {contract.estimatedValue && (
            <div className="prose max-w-none text-gray-700 mt-6">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-2">Valeur</h3>
              <div className="flex items-center text-gray-700">
                <Euro size={18} className="mr-2 text-gray-600" />
                <span className="text-lg font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: contract.estimatedValue.currency,
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }).format(contract.estimatedValue.amount)}
                </span>
                <span className="ml-2 text-sm text-gray-500">(estimation)</span>
              </div>
            </div>
          )}

          {platformLink && (
            <div className="mt-4">
              <a
                href={platformLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ExternalLink size={18} />
                {platformLink.label}
              </a>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-4">Dossier de Consultation des Entreprises (DCE)</h3>
            <div className="space-y-4">
              {isAchatPublicUrl(contract.marketDocumentsUrl) ? (
                <AchatPublicDownloadButton url={contract.marketDocumentsUrl || ''} />
              ) : (
                <DCEDownloadButton
                  consultationUrl={contract.marketDocumentsUrl}
                  contractTitle={contract.title}
                  contractData={{
                    reference: contract.buyerReference || contract.sourceId,
                    buyerName: contract.contractingAuthority.name,
                    announcementNumber: contract.announcementNumber || contract.sourceId
                  }}
                />
              )}
            </div>
          </div>

          {(contract.contractingAuthority.address ||
            contract.contractingAuthority.contactPerson ||
            contract.contractingAuthority.phone ||
            contract.contractingAuthority.email ||
            contract.contractingAuthority.website ||
            contract.contractingAuthority.profileUrl) && (
            <div className="prose max-w-none text-gray-700 mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Informations de contact de l'acheteur</h3>

              <div className="space-y-3 not-prose">
                <div className="flex items-start">
                  <Building2 size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{contract.contractingAuthority.name}</div>
                    {contract.contractingAuthority.type && (
                      <div className="text-sm text-gray-600">{contract.contractingAuthority.type}</div>
                    )}
                  </div>
                </div>

                {contract.contractingAuthority.address && (
                  <div className="flex items-start">
                    <MapPin size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div className="text-gray-700">{contract.contractingAuthority.address}</div>
                  </div>
                )}

                {contract.contractingAuthority.contactPerson && (
                  <div className="flex items-start">
                    <User size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500">Point de contact</div>
                      <div className="text-gray-700">{contract.contractingAuthority.contactPerson}</div>
                    </div>
                  </div>
                )}

                {contract.contractingAuthority.phone && (
                  <div className="flex items-start">
                    <Phone size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <a href={`tel:${contract.contractingAuthority.phone}`} className="text-peach-600 hover:text-peach-800">
                      {contract.contractingAuthority.phone}
                    </a>
                  </div>
                )}

                {contract.contractingAuthority.email && (
                  <div className="flex items-start">
                    <Mail size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <a href={`mailto:${contract.contractingAuthority.email}`} className="text-peach-600 hover:text-peach-800">
                      {contract.contractingAuthority.email}
                    </a>
                  </div>
                )}

                {contract.contractingAuthority.website && (
                  <div className="flex items-start">
                    <Globe size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500">Site web</div>
                      <a
                        href={contract.contractingAuthority.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-peach-600 hover:text-peach-800 inline-flex items-center"
                      >
                        {contract.contractingAuthority.website}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}

                {contract.contractingAuthority.profileUrl && (
                  <div className="flex items-start">
                    <Globe size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500">Profil d'acheteur</div>
                      <a
                        href={contract.contractingAuthority.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-peach-600 hover:text-peach-800 inline-flex items-center"
                      >
                        {contract.contractingAuthority.profileUrl}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(contract.marketDocumentsUrl || contract.submissionUrl) && (
            <div className="prose max-w-none text-gray-700 mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-800 border-b pb-2 mb-4">Documents et soumission</h3>

              <div className="not-prose space-y-4">
                {contract.marketDocumentsUrl && (
                  <div className="flex items-start">
                    <FileText size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Adresse des documents de marché</div>
                      <a
                        href={contract.marketDocumentsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-peach-600 hover:text-peach-800 inline-flex items-center break-all"
                      >
                        {contract.marketDocumentsUrl}
                        <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}

                {contract.submissionUrl && (
                  <div className="flex items-start">
                    <FileText size={18} className="mr-3 mt-0.5 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Adresse de présentation des offres</div>
                      <a
                        href={contract.submissionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-peach-600 hover:text-peach-800 inline-flex items-center break-all"
                      >
                        {contract.submissionUrl}
                        <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="text-sm text-gray-500">
            Source: {contract.source} - ID: {contract.sourceId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailsPage;