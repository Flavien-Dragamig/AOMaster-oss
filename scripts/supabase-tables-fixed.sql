-- Création de la table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS pour protéger les données (vérifier existence)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can read own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own profile" 
      ON user_profiles FOR SELECT 
      USING (auth.uid() = id)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can update own profile" 
      ON user_profiles FOR UPDATE 
      USING (auth.uid() = id)';
  END IF;
END
$$;

-- Création de la table des préférences de facettes utilisateur
CREATE TABLE IF NOT EXISTS user_facet_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  facet_type TEXT NOT NULL,
  facet_values TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, facet_type)
);

-- Activer RLS (Row Level Security)
ALTER TABLE user_facet_preferences ENABLE ROW LEVEL SECURITY;

-- Créer une politique RLS pour protéger les données (vérifier existence)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'user_facet_preferences' AND policyname = 'Users can read own preferences'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own preferences" 
      ON user_facet_preferences FOR SELECT 
      USING (auth.uid() = user_id)';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_policies 
    WHERE tablename = 'user_facet_preferences' AND policyname = 'Users can modify own preferences'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can modify own preferences" 
      ON user_facet_preferences FOR ALL
      USING (auth.uid() = user_id)';
  END IF;
END
$$;
