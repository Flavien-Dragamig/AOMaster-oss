export interface DCEDownloadInfo {
  type: 'direct' | 'place' | 'search-place' | 'unavailable';
  url?: string;
  refConsultation?: string;
  orgAcronyme?: string;
  requiresProxy: boolean;
  searchData?: {
    reference?: string;
    buyerName?: string;
    announcementNumber?: string;
  };
}

export function getDownloadUrl(
  consultationUrl: string | undefined,
  contractData?: {
    reference?: string;
    buyerName?: string;
    announcementNumber?: string;
  }
): DCEDownloadInfo {
  if (!consultationUrl || consultationUrl.trim() === '') {
    if (contractData && (contractData.reference || contractData.announcementNumber)) {
      return {
        type: 'search-place',
        requiresProxy: true,
        searchData: contractData
      };
    }
    return { type: 'unavailable', requiresProxy: false };
  }

  if (consultationUrl.includes('amazonaws.com')) {
    return {
      type: 'direct',
      url: consultationUrl,
      requiresProxy: false
    };
  }

  if (consultationUrl.includes('marches-publics.gouv.fr')) {
    const refMatch = consultationUrl.match(/refConsultation=([^&]+)/);
    const orgMatch = consultationUrl.match(/orgAcronyme=([^&]+)/);

    if (refMatch && orgMatch) {
      const refConsultation = refMatch[1];
      const orgAcronyme = orgMatch[1];

      return {
        type: 'place',
        url: `https://www.marches-publics.gouv.fr/index.php?page=Entreprise.EntrepriseDownloadDce&refConsultation=${refConsultation}&orgAcronyme=${orgAcronyme}`,
        refConsultation,
        orgAcronyme,
        requiresProxy: true
      };
    }

    if (contractData && (contractData.reference || contractData.announcementNumber)) {
      return {
        type: 'search-place',
        requiresProxy: true,
        searchData: contractData
      };
    }
  }

  return { type: 'unavailable', requiresProxy: false };
}

export function getDCEButtonLabel(type: DCEDownloadInfo['type']): string {
  switch (type) {
    case 'direct':
      return 'Téléchargement Direct (Cloud)';
    case 'place':
      return 'Accès Dossier (PLACE)';
    case 'search-place':
      return 'Rechercher sur PLACE';
    case 'unavailable':
    default:
      return 'DCE Non Disponible';
  }
}

export function isPlaceUrl(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('marches-publics.gouv.fr');
}

export function getPlaceConsultationUrl(marketDocumentsUrl: string | undefined): string | null {
  if (!marketDocumentsUrl || !isPlaceUrl(marketDocumentsUrl)) {
    return null;
  }

  const refMatch = marketDocumentsUrl.match(/refConsultation=([^&]+)/);
  const orgMatch = marketDocumentsUrl.match(/orgAcronyme=([^&]+)/);

  if (refMatch && orgMatch) {
    return `https://www.marches-publics.gouv.fr/?page=Entreprise.EntrepriseDetailsConsultation&refConsultation=${refMatch[1]}&orgAcronyme=${orgMatch[1]}`;
  }

  return marketDocumentsUrl;
}

export interface PlatformLinkInfo {
  label: string;
  url: string;
}

/**
 * Détecte la plateforme de publication à partir des URLs du contrat
 * et retourne le label + URL appropriés pour le bouton.
 */
export function getPlatformLink(
  marketDocumentsUrl: string | undefined,
  profileUrl: string | undefined
): PlatformLinkInfo | null {
  // 1. PLACE (marches-publics.gouv.fr)
  if (isPlaceUrl(marketDocumentsUrl)) {
    const placeUrl = getPlaceConsultationUrl(marketDocumentsUrl);
    if (placeUrl) {
      return { label: "Voir l'offre sur PLACE", url: placeUrl };
    }
  }

  // 2. AchatPublic
  if (marketDocumentsUrl?.toLowerCase().includes('achatpublic.com')) {
    const pcslMatch = marketDocumentsUrl.match(/PCSLID=([^&\s]+)/i);
    const url = pcslMatch
      ? `https://www.achatpublic.com/sdm/ent/gen/ent_detail.do?PCSLID=${pcslMatch[1]}`
      : marketDocumentsUrl;
    return { label: "Voir l'offre sur AchatPublic", url };
  }

  // 3. e-marchespublics
  if (marketDocumentsUrl?.includes('e-marchespublics.com')) {
    return { label: "Voir l'offre sur e-marchespublics", url: marketDocumentsUrl };
  }

  // 4. AW Solutions (awsolutions.fr / marches-publics.info)
  if (marketDocumentsUrl?.includes('awsolutions.fr') || marketDocumentsUrl?.includes('marches-publics.info')) {
    return { label: "Voir l'offre sur AW Solutions", url: marketDocumentsUrl };
  }

  // 5. Autre plateforme détectable via le marketDocumentsUrl
  if (marketDocumentsUrl && marketDocumentsUrl.startsWith('http')) {
    try {
      const hostname = new URL(marketDocumentsUrl).hostname.replace('www.', '');
      return { label: `Voir l'offre sur ${hostname}`, url: marketDocumentsUrl };
    } catch {
      // URL invalide, on continue
    }
  }

  // 6. Fallback : profil acheteur si disponible et c'est une vraie plateforme
  if (profileUrl && profileUrl.startsWith('http')) {
    try {
      const hostname = new URL(profileUrl).hostname.replace('www.', '');
      return { label: `Voir le profil acheteur (${hostname})`, url: profileUrl };
    } catch {
      // URL invalide
    }
  }

  return null;
}

export function getDCEButtonIcon(type: DCEDownloadInfo['type']): string {
  switch (type) {
    case 'direct':
      return 'download-cloud';
    case 'place':
      return 'external-link';
    case 'search-place':
      return 'search';
    case 'unavailable':
    default:
      return 'x-circle';
  }
}
