import type { Tender, Contract } from '../../types';

export function tenderToContract(tender: Tender): Contract {
  const hasContractingAuthority = 'contractingAuthority' in tender && typeof tender.contractingAuthority === 'object';

  return {
    id: tender.id,
    title: tender.title,
    description: tender.description || '',
    contractingAuthority: hasContractingAuthority
      ? (tender as any).contractingAuthority
      : {
          name: (tender as any).buyerName || 'Acheteur non spécifié',
          type: '',
          country: 'FR',
        },
    contractType: ((tender as any).contractType || 'mixed') as 'works' | 'supplies' | 'services' | 'mixed',
    publicationDate: new Date(tender.publicationDate || Date.now()),
    submissionDeadline: new Date(tender.submissionDeadline || Date.now()),
    source: 'BOAMP',
    sourceId: tender.id,
    documentUrls: tender.sourceUrl ? [tender.sourceUrl] : [],
    location: (tender as any).location || tender.department || 'N/D',
    department: tender.department || 'N/D',
    status: tender.status,
    sourceUrl: tender.sourceUrl,
    url_avis: (tender as any).url_avis,
    type: (tender as any).type,
    buyerName: (tender as any).buyerName,
    marketDocumentsUrl: tender.url_consultation,
    buyerReference: tender.buyerReference,
    announcementNumber: tender.announcementNumber,
  };
}

export function isContractFormat(data: any): boolean {
  return !!(data && typeof data.contractingAuthority === 'object' && data.contractingAuthority.name);
}

export function isTenderFormat(data: any): boolean {
  return !!(data && typeof data.buyerName === 'string' && !data.contractingAuthority);
}
