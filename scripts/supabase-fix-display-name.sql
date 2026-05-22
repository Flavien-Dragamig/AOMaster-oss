-- Script pour ajouter la colonne display_name si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_profiles' 
    AND column_name = 'display_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
    RAISE NOTICE 'Colonne display_name ajoutée à la table user_profiles';
  ELSE
    RAISE NOTICE 'La colonne display_name existe déjà dans la table user_profiles';
  END IF;
END
$$;
