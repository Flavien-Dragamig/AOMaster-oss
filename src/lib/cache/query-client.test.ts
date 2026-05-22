import { describe, it, expect } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryClient } from './query-client';

describe('Query Client Configuration', () => {
  it('should be an instance of QueryClient', () => {
    expect(queryClient).toBeInstanceOf(QueryClient);
  });

  it('should have custom default options configured', () => {
    const defaultOptions = queryClient.getDefaultOptions();

    // Check if some of our custom settings are applied.
    expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5);
    expect(defaultOptions.queries?.retry).toBe(2);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
  });
});
