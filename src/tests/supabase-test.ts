import { supabase } from '../lib/supabase';

// Fonction asynchrone pour tester la connexion à Supabase
async function testSupabaseConnection() {
  try {
    // Récupérer des informations sur l'utilisateur courant
    // Cette requête fonctionnera même sans données spécifiques dans la base
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur lors de la connexion à Supabase:', error);
      return false;
    }
    
    console.log('Connexion à Supabase réussie!');
    console.log('Session:', data);
    return true;
  } catch (error) {
    console.error('Exception lors de la connexion à Supabase:', error);
    return false;
  }
}

// Exécuter le test
testSupabaseConnection();

export { testSupabaseConnection };
