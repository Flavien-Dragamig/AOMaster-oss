/**
 * @fileoverview Type definitions for API requests and responses.
 * This file centralizes all types related to external APIs like BOAMP
 * and internal API structures.
 */

// import { Database } from './database';

// --- Generic API Types ---

/**
 * A standardized structure for API errors.
 */
export interface ApiError {
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

/**
 * A generic structure for paginated API responses.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// --- BOAMP Opendatasoft API Types ---

/**
 * Represents the overall response from the BOAMP Opendatasoft API.
 */
export interface OdsBoampResponse {
  total_count: number;
  results: OdsBoampRecord[];
  parameters: OdsBoampParameters;
}

/**
 * Represents the parameters object within the ODS API response.
 */
export interface OdsBoampParameters {
  dataset: string[];
  limit: number;
  offset: number;
  format: string;
  timezone: string;
}

/**
 * Represents a single record in the 'results' array from the ODS API.
 * The `fields` property is optional as the API can return records without it.
 */
export interface OdsBoampRecord {
  datasetid: string;
  recordid: string;
  fields?: OdsBoampRecordFields;
  record_timestamp: string;
}

/**
 * Represents the 'fields' object within a record, containing the actual announcement data.
 */
export interface OdsBoampRecordFields {
  id_boamp: string;
  dateparution?: string; // "YYYY-MM-DD"
  objet?: string;
  departement?: string;
  type_marche?: string;
  datelimitereponse?: string; // "YYYY-MM-DD"
  url_boamp?: string;
}

/**
 * Represents the search criteria for querying the BOAMP API.
 * This remains an internal type to structure search requests.
 */
export interface BoampSearchCriteria {
  query: string;
  publicationDateStart?: string; // YYYY-MM-DD
  publicationDateEnd?: string; // YYYY-MM-DD
  department?: string;
  tenderType?: string;
  pageSize?: number;
  page?: number;
}

// --- Internal App Types ---

/**
 * Type representing a user alert, linking to a user profile from Supabase.
 * This demonstrates how to link database types with API types.
 */
/**
 * Represents a tender in the application's internal data model.
 * This is the result of transforming a raw BoampAnnouncement.
 */
export interface Tender {
  id: string;
  title: string;
  publicationDate: string; // Keep as string for simplicity, format in component
  submissionDeadline?: string; // Keep as string for simplicity, format in component
  status: 'open' | 'closed' | 'awarded';
  department: string;
  sourceUrl: string; // URL to the original announcement
  description: string; // A truncated or cleaned-up version of the object
  url_consultation?: string; // URL to consultation documents (DCE)
  buyerReference?: string; // Reference acheteur for PLACE search
  announcementNumber?: string; // Numero d'annonce BOAMP
}

/**
 * A paginated response containing transformed Tenders.
 */
export interface TenderSearchResponse extends PaginatedResponse<Tender> {
  facets?: FacetGroup[];
  totalPages?: number;
}

/**
 * Interface de valeur de facette avec compteur
 */
export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

/**
 * Interface de groupe de facettes (=filtres dynamiques)
 */
export interface FacetGroup {
  name: string;
  label: string;
  values: FacetValue[];
}

// --- Internal App Types ---

/**
 * Type representing a user alert, linking to a user profile from Supabase.
 * This demonstrates how to link database types with API types.
 */
// export type Alert = Database['public']['Tables']['alerts']['Row'] & {
//   user: Database['public']['Tables']['profiles']['Row'];
// };
