/*
  # Migration : Support Google OAuth

  ## Changements
  - Ajout colonne auth_provider sur user_profiles
  - Enrichissement du trigger handle_new_user() pour :
    - Detecter le provider (email, google, etc.)
    - Extraire le prenom/display_name depuis les metadonnees OAuth
    - Marquer first_login_completed = true pour les utilisateurs OAuth
*/

-- =====================================================
-- Ajouter la colonne auth_provider
-- =====================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'email' NOT NULL;

-- =====================================================
-- Enrichir handle_new_user() pour supporter OAuth
-- =====================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  _provider text;
  _first_name text;
  _display_name text;
  _first_login_completed boolean;
BEGIN
  -- Determiner le provider d'authentification
  _provider := COALESCE(
    NEW.raw_app_meta_data->>'provider',
    'email'
  );

  -- Extraire le prenom depuis les metadonnees (Google fournit given_name et full_name)
  _first_name := COALESCE(
    NEW.raw_user_meta_data->>'given_name',
    split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), ' ', 1),
    NEW.raw_user_meta_data->>'first_name',
    NULL
  );

  -- Extraire le display_name
  _display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    _first_name
  );

  -- Pour les utilisateurs OAuth, first_login_completed = true (pas de password a changer)
  _first_login_completed := CASE
    WHEN _provider IN ('google', 'github', 'facebook', 'apple') THEN true
    ELSE false
  END;

  INSERT INTO public.user_profiles (
    user_id, email, first_name, display_name,
    auth_provider, role, alert_preferences,
    first_login_completed, created_at, updated_at
  )
  VALUES (
    NEW.id, NEW.email, NULLIF(_first_name, ''), _display_name,
    _provider, 'user', '{}'::jsonb,
    _first_login_completed, NOW(), NOW()
  );

  RETURN NEW;
END;
$$;
