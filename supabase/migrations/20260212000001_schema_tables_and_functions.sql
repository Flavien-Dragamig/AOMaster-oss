/*
  # Schema consolide AOMaster - Tables et Fonctions

  Migration consolidee remplacant les 16 migrations incrementales.

  ## Tables (10)
  - user_profiles, alerts, user_facet_preferences
  - stripe_customers, subscriptions
  - email_templates, email_logs
  - saved_searches, favorites
  - tracking_config (singleton)

  ## Fonctions
  - update_updated_at_column() : trigger generique pour updated_at
  - handle_new_user() : auto-creation profil a l'inscription
  - is_admin() / is_premium() : verification roles
  - upgrade_to_premium() / promote_to_admin() : elevation privileges
  - increment_use_count() : compteur recherches sauvegardees
*/

-- =====================================================
-- Fonction trigger generique pour updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- Table: user_profiles
-- =====================================================

CREATE TABLE user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text,
  display_name text,
  first_name text,
  business_sector text,
  alert_preferences jsonb DEFAULT '{}'::jsonb NOT NULL,
  premium_until timestamptz,
  stripe_customer_id text,
  role text DEFAULT 'user' NOT NULL CHECK (role IN ('admin', 'user')),
  first_login_completed boolean DEFAULT false,
  password_changed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: alerts
-- =====================================================

CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  keywords text[] DEFAULT '{}',
  cpv_codes text[] DEFAULT '{}',
  departments text[] DEFAULT '{}',
  frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly')),
  filters jsonb DEFAULT '{}'::jsonb NOT NULL,
  last_run timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: user_facet_preferences
-- =====================================================

CREATE TABLE user_facet_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  facet_type text NOT NULL,
  facet_values text[] DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, facet_type)
);

ALTER TABLE user_facet_preferences ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_user_facet_preferences_updated_at
  BEFORE UPDATE ON user_facet_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: stripe_customers
-- =====================================================

CREATE TABLE stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: subscriptions
-- =====================================================

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  stripe_price_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: email_templates
-- =====================================================

CREATE TABLE email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: email_logs
-- =====================================================

CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key text NOT NULL,
  subject text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message text
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Table: saved_searches
-- =====================================================

CREATE TABLE saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
  description text,
  search_params jsonb NOT NULL,
  is_favorite boolean DEFAULT false NOT NULL,
  use_count integer DEFAULT 0 NOT NULL CHECK (use_count >= 0),
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Table: favorites
-- =====================================================

CREATE TABLE favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contract_id text NOT NULL,
  contract_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT favorites_user_contract_unique UNIQUE (user_id, contract_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Table: tracking_config (singleton)
-- =====================================================

CREATE TABLE tracking_config (
  id text PRIMARY KEY DEFAULT 'singleton' CHECK (id = 'singleton'),
  enabled boolean DEFAULT false,
  conversion_id text DEFAULT '',
  conversion_events jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE tracking_config ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_tracking_config_updated_at
  BEFORE UPDATE ON tracking_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Fonctions metier
-- =====================================================

-- Auto-creation de profil a l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, role, alert_preferences, created_at, updated_at)
  VALUES (NEW.id, NEW.email, 'user', '{}'::jsonb, NOW(), NOW());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Verification admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = target_user_id AND role = 'admin'
  );
END;
$$;

-- Verification premium (premium_until OU abonnement actif)
CREATE OR REPLACE FUNCTION is_premium(check_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  target_user_id := COALESCE(check_user_id, auth.uid());

  -- Verifier premium_until dans user_profiles
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = target_user_id AND premium_until > CURRENT_TIMESTAMP
  ) THEN
    RETURN true;
  END IF;

  -- Verifier abonnement actif dans subscriptions
  RETURN EXISTS (
    SELECT 1 FROM subscriptions
    WHERE user_id = target_user_id
    AND status = 'active'
    AND current_period_end > CURRENT_TIMESTAMP
  );
END;
$$;

-- Passage premium
CREATE OR REPLACE FUNCTION upgrade_to_premium(target_user_id uuid, duration_months integer DEFAULT 1)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE user_profiles
  SET premium_until = GREATEST(
    COALESCE(premium_until, CURRENT_TIMESTAMP),
    CURRENT_TIMESTAMP
  ) + (duration_months || ' months')::interval,
  updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

-- Promotion admin
CREATE OR REPLACE FUNCTION promote_to_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can promote users';
  END IF;
  UPDATE user_profiles SET role = 'admin', updated_at = NOW()
  WHERE user_id = target_user_id;
END;
$$;

-- Increment compteur recherches sauvegardees
CREATE OR REPLACE FUNCTION increment_use_count(search_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE saved_searches
  SET use_count = use_count + 1, last_used_at = now()
  WHERE id = search_id;
END;
$$;
