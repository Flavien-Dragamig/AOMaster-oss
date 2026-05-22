/**
 * @fileoverview Configuration for TanStack Query (React Query).
 * This file sets up a reusable QueryClient with sensible defaults for the application.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query function options.
 * These can be overridden at the individual query level.
 */
const defaultQueryOptions = {
  queries: {
    // Time before a query is considered stale (e.g., 5 minutes).
    // This means data will be fetched from cache without a refetch for this duration.
    staleTime: 1000 * 60 * 5,

    // Time before inactive query data is garbage collected (e.g., 15 minutes).
    gcTime: 1000 * 60 * 15,

    // Retry failed requests up to 2 times.
    retry: 2,

    // Do not refetch automatically when the window regains focus.
    // This can be useful to prevent excessive API calls.
    refetchOnWindowFocus: false,
  },
};

/**
 * The global QueryClient instance for the application.
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});
