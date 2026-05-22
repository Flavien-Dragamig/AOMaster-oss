/*
  # Vues consolidees

  - admin_user_stats : statistiques utilisateurs pour le dashboard admin
  - email_stats : statistiques d'envoi d'emails par template
*/

-- =====================================================
-- Vue: admin_user_stats
-- Coherente avec is_premium() : verifie premium_until ET subscriptions
-- =====================================================

CREATE VIEW admin_user_stats
WITH (security_invoker = true)
AS
SELECT
  COUNT(*) FILTER (WHERE role = 'user') as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as total_admins,
  COUNT(*) FILTER (
    WHERE premium_until > CURRENT_TIMESTAMP
    OR EXISTS (
      SELECT 1 FROM subscriptions s
      WHERE s.user_id = user_profiles.user_id
      AND s.status = 'active'
      AND s.current_period_end > CURRENT_TIMESTAMP
    )
  ) as premium_users,
  COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '7 days') as new_users_week,
  COUNT(*) FILTER (WHERE created_at > CURRENT_TIMESTAMP - INTERVAL '30 days') as new_users_month
FROM user_profiles;

-- =====================================================
-- Vue: email_stats
-- =====================================================

CREATE VIEW email_stats
WITH (security_invoker = true)
AS
SELECT
  template_key,
  COUNT(*) as total_sent,
  COUNT(*) FILTER (WHERE status = 'sent') as successful,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'pending') as pending,
  MAX(sent_at) as last_sent
FROM email_logs
GROUP BY template_key;
