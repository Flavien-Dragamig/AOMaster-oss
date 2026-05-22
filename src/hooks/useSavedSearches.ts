import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { savedSearchesService } from '../services/savedSearches';
import type { SavedSearch, SearchFilters } from '../types';
import { useAuth } from './useAuth';

const SAVED_SEARCHES_QUERY_KEY = 'saved-searches';

export function useSavedSearches() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedSearches = [], isLoading } = useQuery({
    queryKey: [SAVED_SEARCHES_QUERY_KEY, user?.id],
    queryFn: () => savedSearchesService.getSavedSearches(user!.id),
    enabled: !!user,
  });

  const { data: favoriteSearches = [] } = useQuery({
    queryKey: [SAVED_SEARCHES_QUERY_KEY, 'favorites', user?.id],
    queryFn: () => savedSearchesService.getFavoriteSearches(user!.id),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: ({
      name,
      searchParams,
      description,
    }: {
      name: string;
      searchParams: SearchFilters;
      description?: string;
    }) => savedSearchesService.createSavedSearch(user!.id, name, searchParams, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_SEARCHES_QUERY_KEY] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: {
        name?: string;
        description?: string | null;
        searchParams?: SearchFilters;
        isFavorite?: boolean;
      };
    }) => savedSearchesService.updateSavedSearch(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_SEARCHES_QUERY_KEY] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => savedSearchesService.deleteSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_SEARCHES_QUERY_KEY] });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      savedSearchesService.toggleFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_SEARCHES_QUERY_KEY] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => savedSearchesService.duplicateSavedSearch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SAVED_SEARCHES_QUERY_KEY] });
    },
  });

  const incrementUseCount = async (id: string) => {
    await savedSearchesService.incrementUseCount(id);
  };

  return {
    savedSearches,
    favoriteSearches,
    isLoading,
    createSavedSearch: createMutation.mutateAsync,
    updateSavedSearch: updateMutation.mutateAsync,
    deleteSavedSearch: deleteMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    duplicateSavedSearch: duplicateMutation.mutateAsync,
    incrementUseCount,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
