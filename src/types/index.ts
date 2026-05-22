import type { User as SupabaseUser } from '@supabase/supabase-js';

// Re-exporting Supabase user type for clarity in the app
export type { SupabaseUser };

/**
 * Defines the structure for search filters used throughout the application.
 * This is the single source of truth for search criteria.
 */
export interface SearchFilters {
  keywords?: string[];
  query?: string;         // Texte de recherche libre (pour API v2.1)
  departments?: string[];
  department?: string;    // Département unique (pour API v2.1)
  categories?: string[];
  procedures?: string[];  // Liste des procédures (procedure_libelle)
  procedure?: string;     // Procédure unique (procedure_libelle)
  procedureStates?: string[]; // États de la procédure (nature_categorise_libelle)
  marketTypes?: string[]; // Types de marché (type_marche_facette)
  typeMarche?: string[]; // e.g., Travaux, Fournitures, Services
  typeProcedure?: string[]; // e.g., Ouverte, Restreinte
  natureMarche?: string[]; // e.g., Marché de travaux, Accord-cadre
  contractType?: string;  // 'works', 'supplies', 'services', 'mixed' (pour API v2.1)
  aoFamilies?: string[];  // Familles d'AO (famille_libelle)
  simplifiedProcedure?: boolean; // Procédure simplifiée (marche_public_simplifie_label)
  extendedSearch?: boolean; // Recherche élargie dans tous les champs textuels
  page?: number;
  pageSize?: number;
}

/**
 * Represents a single tender/contract notice.
 * This is the primary data model for search results.
 */
/**
 * Represents the detailed structure of a contracting authority.
 */
export interface ContractingAuthority {
  name: string;
  id?: string; // e.g., SIRET
  type?: string;
  country?: string; // e.g., 'FR'
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  profileUrl?: string;
}

/**
 * Represents a single contract notice, aligned with the BOAMP API structure.
 * This is the primary data model for search results and details.
 */
export interface Contract {
  id: string;
  title: string;
  description: string;
  contractingAuthority: ContractingAuthority;
  cpvCodes?: { code: string; label: string }[];
  contractType: 'works' | 'supplies' | 'services' | 'mixed';
  publicationDate: Date;
  submissionDeadline: Date;
  source: 'BOAMP' | 'TED';
  sourceId: string;
  documentUrls: string[];
  location: string;
  department: string;
  status: 'open' | 'closed' | 'awarded';
  // URL vers l'avis complet sur BOAMP
  url_avis?: string;
  // URL source pour compatibilité avec composants existants
  sourceUrl?: string;
  // Informations de type marché (BOAMP v2.1)
  type?: string;
  // Nom de l'acheteur (nomacheteur dans BOAMP v2.1)
  buyerName?: string;
  // Nature de publication (nature_categorise_libelle dans BOAMP v2.1)
  natureCategorie?: string;
  // URL vers les documents de marché (DCE)
  marketDocumentsUrl?: string;
  // URL de présentation des offres
  submissionUrl?: string;
  // Reference acheteur for PLACE search
  buyerReference?: string;
  // Numero d'annonce BOAMP
  announcementNumber?: string;
  // Valeur estimée du marché
  estimatedValue?: {
    amount: number;
    currency: string;
  };
}

/**
 * Represents user-defined alerts for tender searches.
 */
export interface Alert {
  id: string;
  userId: string;
  name: string;
  keywords: string[];
  cpvCodes: string[];
  departments: string[];
  filters: SearchFilters;
  frequency: 'daily' | 'weekly';
  lastRun: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents the application's user model.
 */
export interface User extends SupabaseUser {
  // We can extend the Supabase user with custom fields if needed
  // e.g., name: string; company?: string;
}

/**
 * Defines user-specific preferences.
 */
export interface UserPreferences {
  alertFrequency: 'daily' | 'weekly' | 'realtime';
  defaultSearchFilters: SearchFilters;
  savedSearches: SavedSearch[];
}

/**
 * Represents a search configuration saved by the user.
 */
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  searchParams: SearchFilters;
  isFavorite: boolean;
  useCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Types pour le state du formulaire de recherche (doit correspondre à SearchFilters)
 */
export type PageFiltersState = SearchFilters;