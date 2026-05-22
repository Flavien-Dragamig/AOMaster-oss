#!/usr/bin/env bash
# =============================================================================
# AOMaster - Script de demarrage Linux
# Verifie les dependances, lance le serveur dev et ouvre le navigateur
# =============================================================================

set -euo pipefail

# -- Couleurs --
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# -- Configuration --
DEV_PORT=5173
DEV_URL="http://localhost:${DEV_PORT}"
MIN_NODE_MAJOR=18

# -- Fonctions utilitaires --
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERREUR]${NC} $*"; exit 1; }

# -- Se placer dans le repertoire du script --
cd "$(dirname "$0")"

echo ""
echo -e "${BOLD}========================================${NC}"
echo -e "${BOLD}  AOMaster - Demarrage${NC}"
echo -e "${BOLD}========================================${NC}"
echo ""

# =============================================================================
# 1. Verification des prerequis systeme
# =============================================================================
info "Verification des prerequis systeme..."

# Node.js
if ! command -v node &>/dev/null; then
    error "Node.js n'est pas installe. Installez Node.js >= ${MIN_NODE_MAJOR} : https://nodejs.org"
fi
NODE_VERSION=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt "$MIN_NODE_MAJOR" ]; then
    error "Node.js $NODE_VERSION detecte. Version minimale requise : ${MIN_NODE_MAJOR}.x"
fi
success "Node.js v${NODE_VERSION}"

# npm
if ! command -v npm &>/dev/null; then
    error "npm n'est pas installe."
fi
NPM_VERSION=$(npm -v)
success "npm v${NPM_VERSION}"

# Git
if ! command -v git &>/dev/null; then
    warn "Git n'est pas installe (optionnel pour le dev local)."
else
    GIT_VERSION=$(git --version | awk '{print $3}')
    success "Git v${GIT_VERSION}"
fi

# Warning Node < 20
if [ "$NODE_MAJOR" -lt 20 ]; then
    warn "Node.js < 20 detecte. Certains packages peuvent emettre des warnings."
    warn "Mise a jour recommandee : https://nodejs.org"
fi

echo ""

# =============================================================================
# 2. Verification du fichier .env
# =============================================================================
info "Verification de la configuration .env..."

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        warn "Fichier .env absent. Creation a partir de .env.example..."
        cp .env.example .env
        warn "Editez le fichier .env avec vos cles Supabase avant de continuer."
        warn "  -> VITE_SUPABASE_URL"
        warn "  -> VITE_SUPABASE_ANON_KEY"
        echo ""
        read -rp "Appuyez sur Entree une fois le .env configure (ou Ctrl+C pour annuler)..."
    else
        error "Fichier .env et .env.example absents. Creez un fichier .env (voir DEPENDENCIES.md)."
    fi
fi

# Verification que les variables obligatoires sont presentes
if grep -q 'YOUR_SUPABASE_URL' .env 2>/dev/null || grep -q 'YOUR_SUPABASE_ANON_KEY' .env 2>/dev/null; then
    warn "Le fichier .env contient encore les valeurs par defaut."
    warn "Editez .env avec vos vraies cles Supabase avant de lancer l'application."
fi

success "Fichier .env present"
echo ""

# =============================================================================
# 3. Installation / verification des dependances npm
# =============================================================================
info "Verification des dependances npm..."

if [ ! -d node_modules ]; then
    info "Dossier node_modules absent. Installation des dependances..."
    npm install
    success "Dependances installees"
elif [ package.json -nt node_modules ]; then
    info "package.json modifie depuis la derniere installation. Mise a jour..."
    npm install
    success "Dependances mises a jour"
else
    success "Dependances a jour (node_modules present)"
fi

echo ""

# =============================================================================
# 4. Lancement du serveur de developpement
# =============================================================================
info "Demarrage du serveur Vite sur ${DEV_URL} ..."
echo ""

# Fonction pour ouvrir le navigateur apres un delai
open_browser() {
    # Attendre que le serveur soit pret
    local max_wait=30
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if curl -s -o /dev/null -w "" "${DEV_URL}" 2>/dev/null; then
            break
        fi
        sleep 1
        waited=$((waited + 1))
    done

    if [ $waited -ge $max_wait ]; then
        warn "Timeout: le serveur ne repond pas apres ${max_wait}s."
        return
    fi

    # Ouvrir le navigateur
    if command -v xdg-open &>/dev/null; then
        xdg-open "${DEV_URL}" 2>/dev/null &
    elif command -v gnome-open &>/dev/null; then
        gnome-open "${DEV_URL}" 2>/dev/null &
    elif command -v sensible-browser &>/dev/null; then
        sensible-browser "${DEV_URL}" 2>/dev/null &
    else
        info "Ouvrez manuellement : ${DEV_URL}"
        return
    fi
    success "Navigateur ouvert sur ${DEV_URL}"
}

# Lancer l'ouverture du navigateur en arriere-plan
open_browser &

# Lancer Vite (bloquant - Ctrl+C pour arreter)
exec npm run dev
