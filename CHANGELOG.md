# Changelog

Toutes les évolutions notables de ce projet sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage [SemVer](https://semver.org/lang/fr/).

## [0.1.0] — 2026-05-22

Première publication open-source d'AOMaster.

### Ajouté
- Code source applicatif complet (React 18 + Vite + TypeScript).
- Migrations Supabase (`supabase/migrations/`) et Edge Functions
  (`supabase/functions/`) pour la stack backend.
- `.env.example` documenté pour onboarding d'un développeur externe.
- Licence MIT (copyright Dragamig SAS).

### Documentation
- Captures d'écran (accueil, recherche, connexion, inscription) dans
  `docs/screenshots/`, intégrées au README.

### Modifié par rapport à la version privée
- Identifiants administrateur en dur retirés de
  `supabase/functions/create-admin/index.ts` ; lecture désormais via
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` (Edge Function secrets).
- URL de production retirée des allowlists CORS des Edge Functions ;
  un dev externe doit fournir son propre `SITE_URL`.
- Documents internes (rapports d'audit, TODO, configuration infra) non
  publiés.
