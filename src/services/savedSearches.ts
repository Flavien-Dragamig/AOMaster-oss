import { supabase } from '../lib/supabase';
import type { SavedSearch, SearchFilters } from '../types';
import type { Database, Json } from '../types/database';

type SavedSearchRow = Database['public']['Tables']['saved_searches']['Row'];
type SavedSearchInsert = Database['public']['Tables']['saved_searches']['Insert'];
type SavedSearchUpdate = Database['public']['Tables']['saved_searches']['Update'];

function mapRowToSavedSearch(row: SavedSearchRow): SavedSearch {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    searchParams: row.search_params as SearchFilters,
    isFavorite: row.is_favorite,
    useCount: row.use_count,
    lastUsedAt: row.last_used_at ? new Date(row.last_used_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export const savedSearchesService = {
  async getSavedSearches(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(mapRowToSavedSearch);
  },

  async getFavoriteSearches(userId: string): Promise<SavedSearch[]> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', userId)
      .eq('is_favorite', true)
      .order('use_count', { ascending: false });

    if (error) throw error;

    return data.map(mapRowToSavedSearch);
  },

  async getSavedSearch(id: string): Promise<SavedSearch> {
    const { data, error } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Recherche sauvegardée non trouvée');

    return mapRowToSavedSearch(data);
  },

  async createSavedSearch(
    userId: string,
    name: string,
    searchParams: SearchFilters,
    description?: string
  ): Promise<SavedSearch> {
    const insert: SavedSearchInsert = {
      user_id: userId,
      name,
      description: description || null,
      search_params: searchParams as unknown as Json,
      is_favorite: false,
      use_count: 0,
    };

    const { data, error } = await supabase
      .from('saved_searches')
      .insert(insert)
      .select()
      .single();

    if (error) throw error;

    return mapRowToSavedSearch(data);
  },

  async updateSavedSearch(
    id: string,
    updates: {
      name?: string;
      description?: string | null;
      searchParams?: SearchFilters;
      isFavorite?: boolean;
    }
  ): Promise<SavedSearch> {
    const update: SavedSearchUpdate = {
      name: updates.name,
      description: updates.description,
      search_params: updates.searchParams as unknown as Json,
      is_favorite: updates.isFavorite,
    };

    const { data, error } = await supabase
      .from('saved_searches')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapRowToSavedSearch(data);
  },

  async deleteSavedSearch(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementUseCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_use_count', {
      search_id: id,
    });

    if (error) {
      const { data: current } = await supabase
        .from('saved_searches')
        .select('use_count')
        .eq('id', id)
        .single();

      if (current) {
        await supabase
          .from('saved_searches')
          .update({
            use_count: current.use_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq('id', id);
      }
    }
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from('saved_searches')
      .update({ is_favorite: isFavorite })
      .eq('id', id);

    if (error) throw error;
  },

  async duplicateSavedSearch(id: string): Promise<SavedSearch> {
    const original = await this.getSavedSearch(id);

    return this.createSavedSearch(
      original.userId,
      `${original.name} (copie)`,
      original.searchParams,
      original.description || undefined
    );
  },
};
