/*
  # Politiques RLS et Index

  Toutes les politiques RLS utilisent le pattern optimise (select auth.uid())
  pour eviter les evaluations multiples du query planner.
*/

-- =====================================================
-- user_profiles RLS
-- =====================================================

CREATE POLICY "Users can read own profile or admin can read all"
  ON user_profiles FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR is_admin());

-- Pas de INSERT : le trigger handle_new_user cree le profil automatiquement

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- alerts RLS
-- =====================================================

CREATE POLICY "Users can read own alerts"
  ON alerts FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create alerts"
  ON alerts FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- user_facet_preferences RLS
-- =====================================================

CREATE POLICY "Users can read own facet preferences"
  ON user_facet_preferences FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own facet preferences"
  ON user_facet_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own facet preferences"
  ON user_facet_preferences FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own facet preferences"
  ON user_facet_preferences FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- stripe_customers RLS
-- =====================================================

CREATE POLICY "Users can read own stripe customer"
  ON stripe_customers FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own stripe customer"
  ON stripe_customers FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own stripe customer"
  ON stripe_customers FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- subscriptions RLS
-- =====================================================

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own subscriptions"
  ON subscriptions FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- =====================================================
-- email_templates RLS (admin uniquement)
-- =====================================================

CREATE POLICY "Admins can read email templates"
  ON email_templates FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert email templates"
  ON email_templates FOR INSERT TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update email templates"
  ON email_templates FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can delete email templates"
  ON email_templates FOR DELETE TO authenticated
  USING (is_admin());

-- =====================================================
-- email_logs RLS (admin uniquement)
-- =====================================================

CREATE POLICY "Admins can read email logs"
  ON email_logs FOR SELECT TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert email logs"
  ON email_logs FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- =====================================================
-- saved_searches RLS
-- =====================================================

CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own saved searches"
  ON saved_searches FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- favorites RLS
-- =====================================================

CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can add their own favorites"
  ON favorites FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own favorites"
  ON favorites FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE TO authenticated
  USING (user_id = (select auth.uid()));

-- =====================================================
-- tracking_config RLS (lecture publique, ecriture admin)
-- =====================================================

CREATE POLICY "Anyone can read tracking config"
  ON tracking_config FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can update tracking config"
  ON tracking_config FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Admins can insert tracking config"
  ON tracking_config FOR INSERT TO authenticated
  WITH CHECK (is_admin());

-- =====================================================
-- INDEX
-- =====================================================

-- user_profiles
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- alerts
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_frequency ON alerts(frequency);
CREATE INDEX idx_alerts_last_run ON alerts(last_run);

-- user_facet_preferences
CREATE INDEX idx_user_facet_preferences_user_id ON user_facet_preferences(user_id);
CREATE INDEX idx_user_facet_preferences_facet_type ON user_facet_preferences(facet_type);

-- stripe_customers
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_customer_id ON stripe_customers(stripe_customer_id);

-- subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- email_templates
CREATE INDEX idx_email_templates_active ON email_templates(active);

-- email_logs
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- saved_searches
CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_is_favorite ON saved_searches(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_saved_searches_user_created ON saved_searches(user_id, created_at DESC);

-- favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);
