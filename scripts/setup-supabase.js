// Script pour créer les tables Supabase nécessaires pour les profils utilisateurs et préférences
// Ce script doit être exécuté avec Node.js avec les variables d'environnement adéquates

// Importer dotenv pour charger les variables d'environnement
require('dotenv').config({ path: '../.env' });

const { createClient } = require('@supabase/supabase-js');

// Créer le client Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Les variables d\'environnement Supabase sont manquantes');
  process.exit(1);
}

// Créer le client avec la clé de service (pour les droits admin)
const supabase = createClient(supabaseUrl, supabaseKey);

async function setupTables() {
  try {
    console.log('Début de la configuration des tables Supabase...');

    // Vérifier si les tables existent déjà
    const { data: existingTables, error: tableError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('La table user_profiles n\'existe pas, création en cours...');

      // Créer la table user_profiles avec SQL
      const { error: createProfileError } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS user_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL,
            display_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
          
          -- Créer un index sur email
          CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
          
          -- Créer une politique RLS pour protéger les données
          CREATE POLICY "Les utilisateurs peuvent lire leur propre profil" 
            ON user_profiles FOR SELECT 
            USING (auth.uid() = id);
            
          CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" 
            ON user_profiles FOR UPDATE 
            USING (auth.uid() = id);
        `
      });

      if (createProfileError) {
        console.error('Erreur lors de la création de la table user_profiles:', createProfileError);
        return;
      }

      console.log('Table user_profiles créée avec succès');
    } else {
      console.log('La table user_profiles existe déjà');
    }

    // Vérifier si la table des préférences de facettes existe
    const { data: existingFacetPrefs, error: facetError } = await supabase
      .from('user_facet_preferences')
      .select('id')
      .limit(1);

    if (facetError && facetError.code === '42P01') {
      console.log('La table user_facet_preferences n\'existe pas, création en cours...');

      // Créer la table user_facet_preferences
      const { error: createFacetError } = await supabase.rpc('exec_sql', {
        query: `
          CREATE TABLE IF NOT EXISTS user_facet_preferences (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            facet_type TEXT NOT NULL,
            facet_values TEXT[] NOT NULL DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, facet_type)
          );
          
          -- Créer un index sur user_id
          CREATE INDEX IF NOT EXISTS idx_user_facet_preferences_user_id ON user_facet_preferences(user_id);
          
          -- Créer une politique RLS pour protéger les données
          CREATE POLICY "Les utilisateurs peuvent lire leurs propres préférences" 
            ON user_facet_preferences FOR SELECT 
            USING (auth.uid() = user_id);
            
          CREATE POLICY "Les utilisateurs peuvent modifier leurs propres préférences" 
            ON user_facet_preferences FOR ALL
            USING (auth.uid() = user_id);
        `
      });

      if (createFacetError) {
        console.error('Erreur lors de la création de la table user_facet_preferences:', createFacetError);
        return;
      }

      console.log('Table user_facet_preferences créée avec succès');
    } else {
      console.log('La table user_facet_preferences existe déjà');
    }

    // Créer un utilisateur de test si demandé
    const createTestUser = true;
    if (createTestUser) {
      const testEmail = 'test@aomaster.fr';
      const testPassword = 'Testuser123!';

      // Vérifier si l'utilisateur existe déjà
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const userExists = existingUser?.users?.some(user => user.email === testEmail);

      if (!userExists) {
        console.log('Création d\'un utilisateur de test...');
        
        // Créer l'utilisateur de test
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: testEmail,
          password: testPassword,
          email_confirm: true
        });

        if (authError) {
          console.error('Erreur lors de la création de l\'utilisateur de test:', authError);
        } else {
          console.log('Utilisateur de test créé:', authUser);

          // Créer le profil pour l'utilisateur
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authUser.user.id,
              email: testEmail,
              display_name: 'Utilisateur Test'
            });

          if (profileError) {
            console.error('Erreur lors de la création du profil de test:', profileError);
          } else {
            console.log('Profil de test créé');

            // Ajouter des préférences de facettes par défaut
            const { error: facetError } = await supabase
              .from('user_facet_preferences')
              .insert({
                user_id: authUser.user.id,
                facet_type: 'departments',
                facet_values: ['44', '72', '49'] // Exemple: Loire-Atlantique, Sarthe, Maine-et-Loire
              });

            if (facetError) {
              console.error('Erreur lors de la création des préférences de facettes:', facetError);
            } else {
              console.log('Préférences de facettes créées pour l\'utilisateur de test');
            }
          }
        }
      } else {
        console.log('L\'utilisateur de test existe déjà');
      }
    }

    console.log('Configuration Supabase terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de la configuration:', error);
  }
}

setupTables();
