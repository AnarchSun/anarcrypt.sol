#!/bin/bash
# init-repo.sh
set -e

# Aller dans ton projet
cd anaheim-putsch-self-governance-solana-dapp

# Vérifier si git est déjà initialisé
if [ ! -d .git ]; then
  echo "⚙️ Initialisation d’un nouveau repo Git..."
  git init
  git add .
  git commit -m "Initial commit"
else
  echo "✅ Repo Git déjà existant, pas besoin de re-init."
fi

# Créer les branches si elles n’existent pas déjà
for branch in Roots Orion Orion-Exploration Dump; do
  if ! git rev-parse --verify $branch >/dev/null 2>&1; then
    git branch $branch
    echo "🌱 Branche $branch créée"
  else
    echo "✔️ Branche $branch déjà existante"
  fi
done

echo "✅ Repo prêt avec branches : Roots, Main, Orion, Orion-Exploration, Dump"
