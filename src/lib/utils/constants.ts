/**
 * @fileoverview Global constants and configuration for the AOMaster application.
 * This file centralizes configuration to ensure consistency and ease of maintenance.
 */

// --- API Configuration ---
export const API_CONFIG = {
  BOAMP: {
    BASE_URL: 'https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records',
    // As per BOAMP documentation, a reasonable timeout for API calls.
    TIMEOUT: 15000, // 15 seconds
  },
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
};

// --- Application Configuration ---
export const APP_CONFIG = {
  NAME: 'AOMaster',
  VERSION: '1.0.0',
  // Default results per page for pagination
  RESULTS_PER_PAGE: 20,
};

// --- Search Configuration ---
export const SEARCH_CONFIG = {
  // Default filters applied to every search unless overridden
  DEFAULT_FILTERS: {
    // Example: 'departement': '75' to default search to Paris
  },
  // Maximum number of characters for the search query input
  MAX_QUERY_LENGTH: 255,
  // Debounce time in ms for search input to reduce API calls
  DEBOUNCE_DELAY: 500,
};

// --- Plan-based Limits ---
export const PLAN_LIMITS = {
  FREE: {
    MAX_ALERTS: 3,
    MAX_SAVED_SEARCHES: 5,
    DAILY_API_CALLS: 100,
  },
  PRO: {
    MAX_ALERTS: 50,
    MAX_SAVED_SEARCHES: 100,
    DAILY_API_CALLS: 1000,
  },
  ENTERPRISE: {
    MAX_ALERTS: Infinity,
    MAX_SAVED_SEARCHES: Infinity,
    DAILY_API_CALLS: Infinity,
  },
};

// --- Standardized Error Messages (in French) ---
export const ERROR_MESSAGES = {
  // General Errors
  UNEXPECTED: 'Une erreur inattendue est survenue. Veuillez réessayer plus tard.',
  NETWORK: 'Problème de connexion. Veuillez vérifier votre accès à internet.',
  API_TIMEOUT: "Le serveur a mis trop de temps à répondre. Veuillez réessayer.",

  // Auth Errors
  LOGIN_FAILED: 'Email ou mot de passe incorrect.',
  SIGNUP_FAILED: 'La création du compte a échoué. Cet email est peut-être déjà utilisé.',
  SESSION_EXPIRED: 'Votre session a expiré. Veuillez vous reconnecter.',

  // Form Validation Errors
  REQUIRED_FIELD: 'Ce champ est obligatoire.',
  INVALID_EMAIL: 'Veuillez saisir une adresse email valide.',
  PASSWORD_TOO_SHORT: (minLength: number) => `Le mot de passe doit contenir au moins ${minLength} caractères.`,

  // API/Data Errors
  SEARCH_FAILED: 'La recherche a échoué. Veuillez affiner vos critères et réessayer.',
  FETCH_DETAILS_FAILED: "Impossible de récupérer les détails de l'annonce.",
  NO_RESULTS_FOUND: 'Aucun résultat trouvé pour votre recherche.',
};

// --- Other Constants ---
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'aomaster-auth-token',
  THEME: 'aomaster-theme',
  SAVED_SEARCHES: 'aomaster-saved-searches',
};
