import { supabase } from '../lib/supabase';
import type { Database } from '../types/database';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];
type UserFacetPreferenceRow = Database['public']['Tables']['user_facet_preferences']['Row'];

/**
 * Récupère le profil de l'utilisateur courant
 * @returns Profil utilisateur ou null si non trouvé
 */
export async function getCurrentUserProfile(): Promise<UserProfileRow | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur dans getCurrentUserProfile:', error);
    return null;
  }
}

/**
 * Crée ou met à jour un profil utilisateur
 * @param profile Données du profil à sauvegarder
 * @returns Le profil mis à jour ou null en cas d'erreur
 */
export async function saveUserProfile(profile: UserProfileUpdate): Promise<UserProfileRow | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Vérifie si le profil existe déjà
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    // Si checkError, on crée un nouveau profil ; sinon on met à jour l'existant
    
    const { data, error } = existingProfile 
      ? await supabase
          .from('user_profiles')
          .update({ 
            ...profile, 
            updated_at: new Date().toISOString() 
          })
          .eq('user_id', user.id)
          .select()
          .single()
      : await supabase
          .from('user_profiles')
          .insert({ 
            user_id: user.id, 
            email: user.email, 
            ...profile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
    if (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erreur dans saveUserProfile:', error);
    return null;
  }
}

/**
 * Récupère les préférences de facettes d'un utilisateur
 * @returns Préférences formatées en objet Record<string, string[]> ou objet vide
 */
export async function getUserFacetPreferences(): Promise<Record<string, string[]>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    
    const { data, error } = await supabase
      .from('user_facet_preferences')
      .select('*')
      .eq('user_id', user.id);
      
    if (error || !data) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return {};
    }
    
    // Convertir en format utilisable
    const formattedPrefs: Record<string, string[]> = {};
    data.forEach(pref => {
      formattedPrefs[pref.facet_type] = pref.facet_values;
    });
    
    return formattedPrefs;
  } catch (error) {
    console.error('Erreur dans getUserFacetPreferences:', error);
    return {};
  }
}

/**
 * Sauvegarde les préférences de facettes d'un utilisateur
 * @param facetType Type de facette (ex: 'departments')
 * @param values Valeurs sélectionnées
 * @returns true si succès, false si erreur
 */
export async function saveUserFacetPreference(
  facetType: string, 
  values: string[]
): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Si pas de valeurs, supprimer l'entrée
    if (!values || values.length === 0) {
      const { error } = await supabase
        .from('user_facet_preferences')
        .delete()
        .eq('user_id', user.id)
        .eq('facet_type', facetType);
        
      return !error;
    }
    
    // Sinon, mettre à jour ou insérer
    const { error } = await supabase
      .from('user_facet_preferences')
      .upsert({
        user_id: user.id,
        facet_type: facetType,
        facet_values: values,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,facet_type'
      });
      
    if (error) {
      console.error('Erreur lors de la sauvegarde des préférences:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur dans saveUserFacetPreference:', error);
    return false;
  }
}

/**
 * Sauvegarde plusieurs préférences de facettes en une fois
 * @param preferences Objet de préférences
 * @returns true si toutes les opérations ont réussi
 */
export async function saveAllUserFacetPreferences(
  preferences: Record<string, string[]>
): Promise<boolean> {
  try {
    const results = await Promise.all(
      Object.entries(preferences).map(
        ([facetType, values]) => saveUserFacetPreference(facetType, values)
      )
    );
    
    return results.every(result => result === true);
  } catch (error) {
    console.error('Erreur dans saveAllUserFacetPreferences:', error);
    return false;
  }
}
