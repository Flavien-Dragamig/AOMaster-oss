/**
 * @fileoverview Custom React Query hook for searching contracts.
 */
import { useQuery } from '@tanstack/react-query';
import { searchContracts } from '../services/api';
import type { SearchFilters } from '../types';
import type { ApiError, TenderSearchResponse } from '../types/api';

const CONTRACT_SEARCH_QUERY_KEY = 'contractSearch';

/**
 * A custom hook to search for contracts using React Query.
 * It handles data fetching, caching, and state management.
 *
 * @param {SearchFilters} filters The search filters for contracts.
 * @param {boolean} [enabled=true] Whether the query should be enabled to run.
 * @returns The result of the useQuery hook for the contract search.
 */
export const useTenderSearch = (filters: SearchFilters, enabled: boolean = true) => {
  return useQuery<TenderSearchResponse, ApiError>({
    queryKey: [CONTRACT_SEARCH_QUERY_KEY, filters],
    queryFn: () => searchContracts(filters),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (error.statusCode === 404 || error.statusCode === 403) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

