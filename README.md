<div align="center">

# AOMaster

**Veille open-source des marchés publics français — BOAMP & TED.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Stack](https://img.shields.io/badge/stack-React%20%7C%20Vite%20%7C%20Supabase-22c55e.svg)
![Status](https://img.shields.io/badge/status-public%20alpha-orange.svg)

[Fonctionnalités](#fonctionnalités) • [Démarrage](#démarrage-rapide) • [Déploiement](#déploiement) • [Architecture](#architecture) • [Sources](#sources-de-données) • [Contribuer](#contribuer)

</div>

---

AOMaster est une application web qui agrège les avis de **marchés publics
français** (BOAMP) et **européens** (TED) dans une interface unique de
recherche, alertes et suivi. Cette version open-source est extraite du
SaaS exploité par Dragamig SAS — code complet, branding et données prod
retirés.

> **Pour qui ?** PME, indépendants, bureaux d'études et associations qui
> répondent à des appels d'offres et veulent une alternative libre,
> auto-hébergeable, aux outils propriétaires de veille.

## Aperçu

| Accueil | Recherche |
|---|---|
| ![Page d'accueil](./docs/screenshots/01-home.png) | ![Page de recherche](./docs/screenshots/04-search.png) |

| Connexion | Inscription |
|---|---|
| ![Page de connexion](./docs/screenshots/02-login.png) | ![Page d'inscription](./docs/screenshots/03-signup.png) |

## Fonctionnalités

### Recherche & exploration

- **Recherche full-text** sur les avis BOAMP et TED, par mots-clés,
  CPV, département, type de marché, montant estimé, date de
  publication / date limite.
- **Filtres combinables** persistés dans l'URL (partageables).
- **Fiche détaillée** par marché avec téléchargement du DCE
  (Dossier de Consultation des Entreprises) quand le profil acheteur le
  fournit (place, achatpublic).

### Veille active

- **Alertes personnalisées** : un utilisateur crée une recherche, la
  sauvegarde comme alerte, reçoit les nouveaux avis par email selon une
  cadence (quotidienne / hebdo).
- **Favoris & suivi** : marquer un marché, suivre son statut
  (à étudier / en cours / déposé / gagné / perdu) avec notes privées.

### Comptes & équipes

- Authentification email + magic link via Supabase Auth.
- Rôles utilisateur (`user`, `admin`) avec espace admin séparé.
- Invitations par email, force-password-change au premier login,
  reset password.
- Tracking des pages vues (anonymisable, désactivable côté config).

### Administration

- Tableau de bord admin : utilisateurs, messages support, métriques
  d'usage.
- Edge Functions Supabase pour la gestion d'utilisateurs et l'envoi
  d'invitations.

## Architecture

```
┌──────────────────────────────────────────┐
│   Navigateur (React 18 + Vite)            │
│   ─ TanStack Query (cache)                │
│   ─ React Router 6                        │
│   ─ TailwindCSS                           │
└─────────────┬────────────────────────────┘
              │ HTTPS
              ▼
┌──────────────────────────────────────────┐
│   Supabase                                │
│   ├─ PostgreSQL (RLS strict)              │
│   ├─ Auth (JWT)                           │
│   └─ Edge Functions (Deno)                │
│      ─ create-users / invite-user         │
│      ─ force-password-change              │
│      ─ fetch-rc-achatpublic               │
│      ─ download-dce / search-place-dce    │
└─────────────┬────────────────────────────┘
              │ REST / scraping
              ▼
┌──────────────────────────────────────────┐
│   Sources publiques                       │
│   ─ BOAMP (data.gouv.fr / API officielle) │
│   ─ TED (ted.europa.eu)                   │
│   ─ Profils acheteurs (place, etc.)       │
└──────────────────────────────────────────┘
```

## Stack technique & dépendances OSS

L'intégralité de la stack est libre. Chaque outil est listé avec sa
licence d'origine, conformément à l'esprit OSS.

### Frontend

| Outil | Version | Licence | Rôle |
|---|---|---|---|
| [React](https://react.dev) | 18 | MIT | UI déclarative |
| [Vite](https://vite.dev) | 8 | MIT | Build & dev server |
| [TypeScript](https://www.typescriptlang.org) | 5 | Apache-2.0 | Typage statique |
| [TailwindCSS](https://tailwindcss.com) | 3 | MIT | Styling utility-first |
| [TanStack Query](https://tanstack.com/query) | 5 | MIT | Cache & data fetching |
| [React Router](https://reactrouter.com) | 6 | MIT | Routing client |
| [Zod](https://zod.dev) | 3 | MIT | Validation de schémas |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3 | (Apache-2.0 OR MPL-2.0) | Sanitization HTML |

### Backend

| Outil | Licence | Rôle |
|---|---|---|
| [Supabase](https://supabase.com) | Apache-2.0 | Postgres + Auth + Edge Functions |
| [PostgreSQL](https://www.postgresql.org) | PostgreSQL License | Base de données |
| [Deno](https://deno.com) | MIT | Runtime des Edge Functions |

### Qualité & tests

| Outil | Licence | Rôle |
|---|---|---|
| [Vitest](https://vitest.dev) | MIT | Test runner |
| [Testing Library](https://testing-library.com) | MIT | Tests composants React |
| [ESLint](https://eslint.org) | MIT | Lint |
| [jsdom](https://github.com/jsdom/jsdom) | MIT | DOM headless pour tests |

### Infrastructure

| Outil | Licence | Rôle |
|---|---|---|
| [nginx](https://nginx.org) | BSD-2-Clause | Serveur statique en prod |
| [Docker](https://www.docker.com) | Apache-2.0 | Conteneurisation |

## Démarrage rapide

### Prérequis

- **Node.js ≥ 18** (testé sur 20 LTS)
- **npm** (ou pnpm)
- Un projet **[Supabase](https://supabase.com)** (offre gratuite suffisante)

### Installation

```bash
git clone https://github.com/Flavien-Dragamig/AOMaster-oss.git
cd AOMaster-oss
cp .env.example .env
npm install
npm run dev
```

L'application est servie sur `http://localhost:5173`.

## Configuration

Toutes les variables nécessaires sont documentées dans
[`.env.example`](./.env.example). Les principales :

| Variable | Côté | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | client | URL du projet Supabase (`https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | client | Clé `anon` publique du projet |
| `SUPABASE_SERVICE_ROLE_KEY` | server | Clé service-role (Edge Functions uniquement) |
| `SITE_URL` | server | URL canonique de l'app (pour les emails) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | server | Compte admin bootstrap (Edge Function `create-admin`) |

> ⚠️ Ne **jamais** committer un `.env` rempli. Seul `.env.example`
> doit être versionné.

### Mise en place de Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans `.env`.
3. Appliquer le schéma :

   ```bash
   npx supabase login
   npx supabase link --project-ref VOTRE_REF
   npx supabase db push
   ```

4. Déployer les Edge Functions :

   ```bash
   npx supabase functions deploy
   ```

5. Définir les secrets côté Edge Functions :

   ```bash
   npx supabase secrets set SITE_URL=http://localhost:5173
   npx supabase secrets set ADMIN_EMAIL=admin@example.com
   npx supabase secrets set ADMIN_PASSWORD='ChangezMoi!2026'
   ```

## Déploiement

### Build de production

```bash
npm run build      # génère dist/
npm run preview    # sert dist/ localement pour validation
```

### Docker (nginx)

Un `Dockerfile` multi-stage est fourni à la racine :

```bash
docker build -t aomaster .
docker run -p 8080:80 --env-file .env aomaster
```

L'image finale est basée sur `nginx:alpine` et sert le bundle statique
avec la configuration `nginx.conf` incluse (gzip, fallback SPA).

### Cibles compatibles

Le bundle étant 100 % statique, n'importe quel hébergeur de fichiers
statiques convient : Cloudflare Pages, Vercel, Netlify, OVH, Scaleway,
serveur dédié + nginx, etc. Seul prérequis : pouvoir injecter les
variables `VITE_*` au moment du build.

## Scripts npm

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de dev Vite (hot reload) |
| `npm run build` | Build de production (`dist/`) |
| `npm run preview` | Sert le build localement |
| `npm run lint` | ESLint sur tout le projet |
| `npm test` | Suite Vitest (run unique) |
| `npm run test:watch` | Vitest en mode watch |

## Structure du projet

```
.
├── src/
│   ├── components/     # composants UI réutilisables
│   ├── pages/          # routes (React Router)
│   ├── contexts/       # contextes React (auth, tracking, toast)
│   ├── hooks/          # hooks custom
│   ├── lib/            # client Supabase, utils
│   ├── services/       # appels API métier (BOAMP, TED)
│   ├── data/           # référentiels statiques (départements, CPV)
│   └── tests/          # setup et fixtures de tests
├── supabase/
│   ├── migrations/     # schéma Postgres versionné
│   ├── functions/      # Edge Functions Deno
│   ├── config.toml
│   └── seed.sql
├── scripts/            # scripts utilitaires (setup, fixtures)
├── docs/screenshots/   # captures du README
├── Dockerfile          # image nginx multi-stage
└── nginx.conf          # config nginx pour le SPA
```

## Sources de données

AOMaster s'appuie exclusivement sur des sources publiques ouvertes :

| Source | URL | Licence des données |
|---|---|---|
| **BOAMP** — Bulletin officiel des annonces des marchés publics | [boamp.fr](https://www.boamp.fr) / [data.gouv.fr](https://www.data.gouv.fr) | [Licence Ouverte 2.0 (Etalab)](https://www.etalab.gouv.fr/licence-ouverte-open-licence/) |
| **TED** — Tenders Electronic Daily (UE) | [ted.europa.eu](https://ted.europa.eu) | Réutilisation libre — [conditions TED](https://ted.europa.eu/en/notice-detail) |
| **place** — Plateforme des achats de l'État | [place.marches-publics.gouv.fr](https://place.marches-publics.gouv.fr) | DCE publics, lecture seule |

Tous les accès se font dans le respect des conditions de réutilisation
publiées par chaque source. AOMaster ne stocke pas les DCE — il les
relaie vers le profil acheteur officiel.

## Tests & qualité

```bash
npm test
```

→ **81 tests** Vitest + Testing Library, couvrant les transformateurs
BOAMP, le cache TanStack Query, les utilitaires de département, et les
schémas Zod côté API.

`npm run lint` exécute ESLint avec la configuration TypeScript stricte
fournie.

## Contribuer

Les contributions sont bienvenues. Lire d'abord
[CONTRIBUTING.md](./CONTRIBUTING.md) pour le workflow (issues, branches,
Conventional Commits, revue de PR).

Pour signaler un bug ou proposer une évolution : ouvrir une issue sur
[github.com/Flavien-Dragamig/AOMaster-oss/issues](https://github.com/Flavien-Dragamig/AOMaster-oss/issues).

## Sécurité

Si vous identifiez une faille, **ne pas** ouvrir d'issue publique.
Contacter directement : `security@dragamig.fr`. Une réponse est faite
sous 72 h ouvrées.

## Changelog

Voir [CHANGELOG.md](./CHANGELOG.md). Le projet suit
[SemVer](https://semver.org) et [Conventional Commits](https://www.conventionalcommits.org).

## À propos

> **Créé par [Studio Dragamig](https://dragamig.fr) avec l'aide de Claude d'Anthropic.**

Studio Dragamig est un studio de Vibe Coding indépendant qui conçoit
des outils web sur mesure pour PME et associations. Une partie
significative du code, de la documentation et de l'extraction
open-source de ce projet a été produite avec l'assistance d'un agent
LLM ([Claude](https://www.anthropic.com/claude), Anthropic) sous
supervision humaine. Les choix d'architecture, les revues et la
validation finale restent de la responsabilité de
[Dragamig SAS](https://dragamig.fr).

## Remerciements

- L'équipe **[Etalab](https://www.etalab.gouv.fr)** et l'écosystème
  `data.gouv.fr` pour la mise à disposition ouverte du BOAMP.
- L'**Office des publications de l'Union européenne** pour la
  réutilisation libre de TED.
- Les mainteneurs des projets OSS listés ci-dessus, sans qui AOMaster
  n'existerait pas.
- [Pexels](https://www.pexels.com/license/) pour les images
  d'illustration de la page d'accueil (licence permissive).

## Licence

[MIT](./LICENSE) — Copyright © 2026 Dragamig SAS.

Vous êtes libre d'utiliser, modifier, redistribuer ce code, y compris
à des fins commerciales, à condition de conserver l'avis de copyright
et la licence. Aucune garantie n'est fournie.
