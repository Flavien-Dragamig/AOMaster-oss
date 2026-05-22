-- Script pour vérifier et ajouter la colonne email si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND column_name = 'email'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN email TEXT;
    RAISE NOTICE 'Colonne email ajoutée à la table user_profiles';
  ELSE
    RAISE NOTICE 'La colonne email existe déjà dans la table user_profiles';
  END IF;
END
$$;

-- Rafraîchir le cache du schéma PostgREST (peut nécessiter des droits administrateur)
-- Décommenter et exécuter si nécessaire:
-- SELECT pg_reload_conf();
