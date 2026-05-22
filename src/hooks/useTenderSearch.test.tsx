import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTenderSearch } from './useTenderSearch';
import * as apiService from '../services/api';
import type { SearchFilters, Tender } from '../types';
import type { TenderSearchResponse } from '../types/api';

// Mock the central API service
vi.mock('../services/api');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
      },
    },
  });

describe('useTenderSearch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call searchContracts and return the results', async () => {
    const searchFilters: SearchFilters = { query: 'test' };

    const mockTenders: Tender[] = [
      {
        id: 'BOAMP-12345',
        title: 'Test Tender',
        description: 'A test tender description.',
        publicationDate: '2024-01-15T00:00:00Z',
        submissionDeadline: '2024-02-15T00:00:00Z',
        status: 'open',
        department: '75',
        type: 'Services',
        sourceUrl: 'http://example.com/tender/12345',
      },
    ];

    const mockApiResponse: TenderSearchResponse = {
      items: mockTenders,
      total: 1,
      pageSize: 10,
    };

    // Mock the implementation of the searchContracts function
    const mockedSearchContracts = vi.spyOn(apiService, 'searchContracts');
    mockedSearchContracts.mockResolvedValue(mockApiResponse);

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useTenderSearch(searchFilters, true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedSearchContracts).toHaveBeenCalledWith(searchFilters);
    expect(result.current.data?.items).toEqual(mockTenders);
    expect(result.current.data?.total).toBe(1);
  });
});

