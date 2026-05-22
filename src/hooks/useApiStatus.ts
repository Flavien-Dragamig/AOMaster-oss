/**
 * @fileoverview Custom React Query hook to check the status of the BOAMP API.
 */

/**
 * @fileoverview Custom React Query hook to check the status of the BOAMP API.
 */

import { useQuery } from '@tanstack/react-query';
import { searchContracts } from '../services/api';

const API_STATUS_QUERY_KEY = 'apiStatus';

/**
 * A custom hook to check the BOAMP API status by making a lightweight request.
 * It returns the query result, which includes the status, isLoading, and isError flags.
 */
export const useApiStatus = () => {
  return useQuery({
    queryKey: [API_STATUS_QUERY_KEY],
    // Perform a minimal search to check if the API is responsive.
    queryFn: () => searchContracts({ pageSize: 1 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    retry: 1, // Retry once on failure
  });
};
