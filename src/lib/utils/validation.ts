/**
 * @fileoverview Form and data validation schemas using Zod.
 * Centralizes all validation logic for consistency and reusability.
 */

import { z } from 'zod';
import { ERROR_MESSAGES, SEARCH_CONFIG } from './constants';

// --- Base Schemas ---

/**
 * Schema for a valid email address.
 */
export const emailSchema = z
  .string({
    required_error: ERROR_MESSAGES.REQUIRED_FIELD,
  })
  .min(1, { message: ERROR_MESSAGES.REQUIRED_FIELD }) // An empty string is not a valid email
  .email({ message: ERROR_MESSAGES.INVALID_EMAIL });

/**
 * Schema for a secure password.
 * Minimum 8 characters.
 */
export const passwordSchema = z
  .string({
    required_error: ERROR_MESSAGES.REQUIRED_FIELD,
  })
  .min(8, { message: ERROR_MESSAGES.PASSWORD_TOO_SHORT(8) });

// --- Authentication Schemas ---

/**
 * Schema for the login form.
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Schema for the signup form.
 */
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  // Example of adding a confirm password field
  // confirmPassword: passwordSchema,
})//.refine((data) => data.password === data.confirmPassword, {
  //  message: 'Les mots de passe ne correspondent pas.',
  //  path: ['confirmPassword'], // path of error
//});

// --- Search Schemas ---

/**
 * Schema for the main tender search form.
 */
export const tenderSearchSchema = z.object({
  query: z
    .string()
    .min(1, { message: ERROR_MESSAGES.REQUIRED_FIELD })
    .max(SEARCH_CONFIG.MAX_QUERY_LENGTH, { 
      message: `La recherche ne peut pas dépasser ${SEARCH_CONFIG.MAX_QUERY_LENGTH} caractères.` 
    }),
  // Example: Adding department validation (e.g., 2-digit string)
  departement: z
    .string()
    .regex(/^\d{2,3}$/, { message: 'Code département invalide.' })
    .optional(),
  // Example: Date range validation
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine((data) => {
  // Ensure end date is not before start date
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: "La date de fin ne peut pas être antérieure à la date de début.",
  path: ['endDate'],
});

// --- BOAMP Data Validation (Example) ---

/**
 * A basic schema to validate the structure of a BOAMP announcement.
 * This can be expanded to be more comprehensive based on the actual API response.
 */
export const boampAnnouncementSchema = z.object({
  id: z.string(),
  type: z.string(),
  objet: z.string(),
  dateparution: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  departement: z.string(),
  // Add other fields as necessary
});

// --- Type Inference from Schemas ---

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type TenderSearchFormData = z.infer<typeof tenderSearchSchema>;
