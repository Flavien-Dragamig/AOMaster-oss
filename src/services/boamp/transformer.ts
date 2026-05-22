/**
 * @fileoverview Service for transforming BOAMP API data into the application's internal data model.
 */

import type { OdsBoampRecord, OdsBoampResponse, Tender, TenderSearchResponse } from '../../types/api';
import { truncateText } from '../../lib/utils/format';
import { formatDepartments } from '../../lib/utils/department-formatter';

/**
 * Transforms a single BOAMP record from the Opendatasoft API into a Tender object.
 * @param {OdsBoampRecord} record The raw record from the ODS API.
 * @returns {Tender} The transformed Tender object.
 */
export function transformTender(record: any): Tender {
  // The API response is now flat, no 'fields' property.
  if (!record || !record.idweb) {
    console.warn('Skipping malformed record:', record);
    return {
      id: 'unknown',
      title: 'No title',
      description: 'No description',
      publicationDate: '',
      submissionDeadline: '',
      buyerName: 'N/A',
      department: 'N/A',
      type: 'N/A',
      sourceUrl: '',
    };
  }

  const submissionDeadline = record.datelimitereponse;

  let status: 'open' | 'closed' | 'awarded' = 'open';
  if (submissionDeadline) {
    // Compare dates as strings
    if (new Date().toISOString().split('T')[0] > submissionDeadline) {
      status = 'closed';
    }
  }

  return {
    id: record.idweb, // 'idweb' is the unique identifier
    title: record.objet || 'Titre non disponible',
    publicationDate: record.dateparution || new Date(0).toISOString(),
    submissionDeadline,
    status,
    buyerName: record.nomacheteur || 'Acheteur non spécifié',
    department: formatDepartments(record.code_departement),
    type: Array.isArray(record.type_marche_facette) ? record.type_marche_facette.join(', ') : (record.type_marche_facette || 'Non spécifié'),
    sourceUrl: record.url_avis || '', // 'url_avis' is the direct link
    description: truncateText(record.objet || '', 150),
    url_consultation: record.adresse_documents_marche || record.url_dce || undefined,
    buyerReference: record.refacheteur || record.reference || undefined,
    announcementNumber: record.idweb || record.id_boamp || undefined,
  };
}

/**
 * Transforms a paginated search response from the Opendatasoft BOAMP API.
 * @param {OdsBoampResponse} response The raw search response from the ODS API.
 * @returns {TenderSearchResponse} The transformed search response with Tender objects.
 */
export function transformSearchResponse(response: OdsBoampResponse): TenderSearchResponse {
  const items = response.results.map(transformTender);

  const { limit = 20, offset = 0 } = response.parameters || {};
  const page = limit > 0 ? Math.floor(offset / limit) + 1 : 1;

  return {
    items,
    total: response.total_count,
    page,
    pageSize: limit,
  };
}
