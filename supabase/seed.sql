-- =====================================================
-- Seed : Templates email par defaut
-- =====================================================

INSERT INTO email_templates (template_key, name, subject, body, variables, active) VALUES
(
  'welcome',
  'Message de bienvenue',
  'Bienvenue sur AOMaster',
  '<h1>Bienvenue {{user_name}} !</h1>
<p>Nous sommes ravis de vous accueillir sur AOMaster, votre plateforme de veille des marchés publics.</p>
<p>Avec AOMaster, vous pouvez :</p>
<ul>
  <li>Rechercher des appels d''offres pertinents</li>
  <li>Créer des alertes personnalisées</li>
  <li>Suivre vos opportunités</li>
</ul>
<p>Commencez dès maintenant votre recherche !</p>
<p>Cordialement,<br/>L''équipe AOMaster</p>',
  '["user_name", "user_email"]'::jsonb,
  true
),
(
  'account_validation',
  'Validation de compte',
  'Votre compte a été validé',
  '<h1>Compte validé</h1>
<p>Bonjour {{user_name}},</p>
<p>Votre compte a été validé avec succès par notre équipe.</p>
<p>Vous pouvez maintenant profiter pleinement de toutes les fonctionnalités d''AOMaster.</p>
<p>Cordialement,<br/>L''équipe AOMaster</p>',
  '["user_name", "user_email"]'::jsonb,
  true
),
(
  'premium_upgrade',
  'Passage Premium',
  'Bienvenue dans AOMaster Premium',
  '<h1>Merci pour votre abonnement Premium !</h1>
<p>Bonjour {{user_name}},</p>
<p>Merci d''avoir souscrit à l''offre Premium d''AOMaster.</p>
<p>Vous bénéficiez maintenant de :</p>
<ul>
  <li>Alertes illimitées</li>
  <li>Export avancé des résultats</li>
  <li>Support prioritaire</li>
  <li>Accès aux statistiques détaillées</li>
</ul>
<p>Votre abonnement est actif jusqu''au {{premium_until}}.</p>
<p>Cordialement,<br/>L''équipe AOMaster</p>',
  '["user_name", "user_email", "premium_until"]'::jsonb,
  true
),
(
  'password_reset',
  'Réinitialisation du mot de passe',
  'Réinitialisation de votre mot de passe',
  '<h1>Réinitialisation de mot de passe</h1>
<p>Bonjour {{user_name}},</p>
<p>Vous avez demandé à réinitialiser votre mot de passe.</p>
<p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
<p><a href="{{reset_link}}">Réinitialiser mon mot de passe</a></p>
<p>Si vous n''avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
<p>Cordialement,<br/>L''équipe AOMaster</p>',
  '["user_name", "user_email", "reset_link"]'::jsonb,
  true
),
(
  'alert_notification',
  'Notification d''alerte',
  'Nouveaux marchés correspondant à vos critères',
  '<h1>Nouveaux marchés publics</h1>
<p>Bonjour {{user_name}},</p>
<p>Nous avons trouvé {{count}} nouveaux marchés correspondant à vos critères de recherche.</p>
<p>{{results}}</p>
<p>Consultez votre dashboard pour plus de détails.</p>
<p>Cordialement,<br/>L''équipe AOMaster</p>',
  '["user_name", "user_email", "count", "results"]'::jsonb,
  true
)
ON CONFLICT (template_key) DO NOTHING;

-- =====================================================
-- Seed : Configuration tracking (singleton)
-- =====================================================

INSERT INTO tracking_config (id, enabled, conversion_id, conversion_events)
VALUES (
  'singleton',
  false,
  '',
  '[
    {"event_name": "signup", "label": "", "description": "Inscription utilisateur", "active": true},
    {"event_name": "login", "label": "", "description": "Connexion utilisateur", "active": true},
    {"event_name": "search", "label": "", "description": "Recherche effectuée", "active": true},
    {"event_name": "view_contract", "label": "", "description": "Consultation d''un marché", "active": true},
    {"event_name": "download_dce", "label": "", "description": "Téléchargement DCE", "active": true},
    {"event_name": "create_alert", "label": "", "description": "Création d''alerte", "active": true},
    {"event_name": "add_favorite", "label": "", "description": "Ajout aux favoris", "active": true}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
