# Changelog

Toutes les évolutions notables de ce projet sont consignées ici.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage [SemVer](https://semver.org/lang/fr/).

## [0.2.0] — 2026-05-22

### Ajouté
- Mention de transparence « Créé par Studio Dragamig avec l'aide de
  Claude d'Anthropic » en pied de page de l'application (lien vers
  dragamig.fr).
- Lien retour discret « par Studio Dragamig » dans le header, à côté
  du logo AOMaster.

### Sécurité
- Traitement de l'ensemble des 14 vulnérabilités Dependabot remontées
  sur le commit initial (`npm audit fix`).
- Montée de version Vite 5 → 8 pour purger les CVE `esbuild < 0.25`
  (impact dev-server uniquement).
- `npm audit` : 0 vulnérabilité connue sur le bundle de production.

### Documentation
- Refonte complète du README au format « state of the art » :
  fonctionnalités orientées utilisateur, diagramme d'architecture
  ASCII, tableaux de dépendances OSS avec licence par outil,
  section déploiement (build + Docker + cibles cloud), section
  Sources de données citant BOAMP (Licence Ouverte Etalab) et TED
  (réutilisation libre UE), section Sécurité avec contact responsible
  disclosure, section Remerciements (Etalab, OP Union Européenne,
  mainteneurs OSS, Pexels).
- Extraction du template canonique de README Studio Dragamig
  (hors repo, dans la base de connaissance interne) pour
  réutilisation sur les prochains repos OSS Dragamig.

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
