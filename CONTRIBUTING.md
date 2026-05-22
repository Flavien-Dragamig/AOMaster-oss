# Contribuer à AOMaster

Merci de l'intérêt porté au projet. Ce document décrit comment installer
l'environnement de développement, lancer les tests, et soumettre une
contribution.

## Installation

Prérequis : **Node.js ≥ 18**, **npm** (ou **pnpm**), et un projet Supabase
(local via la CLI ou hébergé sur supabase.com).

```bash
git clone https://github.com/Flavien-Dragamig/AOMaster-oss.git
cd AOMaster-oss
cp .env.example .env   # renseigner les valeurs
npm install
npm run dev
```

Pour la stack Supabase locale (optionnel) :

```bash
npx supabase start
npx supabase db reset    # applique les migrations + seed.sql
```

## Lancer les tests

```bash
npm test
```

La suite tourne avec [Vitest](https://vitest.dev/). Certains tests
nécessitent une connexion Supabase fonctionnelle (voir
`src/tests/supabase-test.ts`).

## Style et convention de commit

- **TypeScript strict** : pas de `any` implicite, pas de `// @ts-ignore`
  sans justification.
- **Lint** : `npm run lint` doit passer.
- **Messages de commit** : format
  [Conventional Commits](https://www.conventionalcommits.org/fr/v1.0.0/)
  (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).

## Signaler un bug ou proposer une fonctionnalité

Ouvrir une issue GitHub avec :

1. Description du problème ou de la proposition.
2. Étapes de reproduction (pour un bug).
3. Comportement attendu vs observé.
4. Environnement (navigateur, OS, version Node).

## Pull requests

- Une PR = un sujet.
- Lier l'issue concernée (`Closes #123`).
- Vérifier que `npm run lint`, `npm run build` et `npm test` passent
  localement avant ouverture.

## Licence

En contribuant, vous acceptez que votre contribution soit publiée sous la
licence MIT du projet.
