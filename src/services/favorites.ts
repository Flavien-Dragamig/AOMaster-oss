import { supabase } from '../lib/supabase';
import type { Contract } from '../types';
import type { Database, Json } from '../types/database';

type FavoriteRow = Database['public']['Tables']['favorites']['Row'];

export interface Favorite {
  id: string;
  userId: string;
  contractId: string;
  contractData: Contract;
  createdAt: string;
}

function mapRowToFavorite(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    contractId: row.contract_id,
    contractData: row.contract_data as unknown as Contract,
    createdAt: row.created_at,
  };
}

export async function addFavorite(contractId: string, contractData: Contract): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        contract_id: contractId,
        contract_data: contractData as unknown as Json,
      });

    if (error) {
      if (error.code === '23505') {
        return { success: false, error: 'Cette annonce est déjà dans vos favoris' };
      }
      console.error('Error adding favorite:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return { success: false, error: 'Erreur lors de l\'ajout aux favoris' };
  }
}

export async function removeFavorite(contractId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('contract_id', contractId);

    if (error) {
      console.error('Error removing favorite:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error: 'Erreur lors de la suppression du favori' };
  }
}

export async function isFavorite(contractId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('contract_id', contractId)
      .maybeSingle();

    if (error) {
      console.error('Error checking favorite:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
}

export async function getUserFavorites(): Promise<{ data: Favorite[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { data: [], error: 'Utilisateur non authentifié' };
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return { data: [], error: error.message };
    }

    return { data: (data || []).map(mapRowToFavorite) };
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return { data: [], error: 'Erreur lors de la récupération des favoris' };
  }
}

export async function getFavoritesCount(): Promise<number> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return 0;
    }

    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error counting favorites:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error counting favorites:', error);
    return 0;
  }
}

export async function toggleFavorite(contractId: string, contractData: Contract): Promise<{ success: boolean; isFavorite: boolean; error?: string }> {
  const favorited = await isFavorite(contractId);

  if (favorited) {
    const result = await removeFavorite(contractId);
    return { ...result, isFavorite: false };
  } else {
    const result = await addFavorite(contractId, contractData);
    return { ...result, isFavorite: true };
  }
}
