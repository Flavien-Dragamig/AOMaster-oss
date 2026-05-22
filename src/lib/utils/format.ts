/**
 * @fileoverview Text, date, and currency formatting utilities.
 * These helpers ensure consistent data presentation across the application.
 */

import { format, formatDistanceToNow, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formats a date object or string into a more readable format (e.g., '16 juin 2025').
 * @param date - The date to format (Date object, timestamp, or ISO string).
 * @param dateFormat - The desired output format string (defaults to 'd MMMM yyyy').
 * @returns The formatted date string, or an empty string if the date is invalid.
 */
export const formatDate = (date: Date | number | string, dateFormat = 'd MMMM yyyy'): string => {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return '';
  }
  return format(dateObj, dateFormat, { locale: fr });
};

/**
 * Formats a date to show the relative time from now (e.g., 'il y a 5 minutes').
 * @param date - The date to format.
 * @returns The relative time string.
 */
export const formatRelativeDate = (date: Date | number | string): string => {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return '';
  }
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
};

/**
 * Formats a number as a currency string in Euros.
 * @param amount - The number to format.
 * @param options - Intl.NumberFormat options.
 * @returns The formatted currency string (e.g., '1 234,56 €').
 */
export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    ...options,
  };
  return new Intl.NumberFormat('fr-FR', defaultOptions).format(amount);
};

/**
 * Truncates a string to a specified length without cutting words, adding an ellipsis.
 * @param text - The text to truncate.
 * @param maxLength - The maximum length of the output string.
 * @returns The truncated string.
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }

  // Take a substring to avoid searching the whole text and find the last space.
  const sub = text.substring(0, maxLength);
  const lastSpace = sub.lastIndexOf(' ');

  // If a space is found, truncate at the space. Otherwise (e.g., a single long word),
  // truncate at maxLength to avoid returning an empty string.
  const truncated = lastSpace > 0 ? sub.substring(0, lastSpace) : sub;

  return truncated + '...';
};

/**
 * Formats a CPV code by adding spaces for readability.
 * Example: '71000000' becomes '71000000 - Services d'architecture...'
 * (This is a placeholder, a real implementation would use a CPV code dictionary)
 * @param code - The CPV code string.
 * @returns The formatted CPV code.
 */
export const formatCpvCode = (code: string): string => {
  // In a real app, this would look up the code in a dictionary.
  // For now, we just return the code as is.
  return code;
};
