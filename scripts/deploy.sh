#!/bin/bash

set -e  # Stopper immédiatement si une commande échoue
set -u  # Stopper si une variable non définie est utilisée

echo "==== Déploiement Complet du Projet Anarcrypt ===="

# Variables globales
ANCHOR_DIR=~/anarcrypt.sol/AnnAHeim/anchor
DAPP_DIR=~/anarcrypt.sol/dapp

# Fonction : Déployer un programme Solana indépendant
deploy_solana_program() {
  PROGRAM_PATH=$1
  echo "🚀 Déploiement d'un programme Solana indépendant : ${PROGRAM_PATH}..."
  solana program deploy "${PROGRAM_PATH}"
}

# Étape 1 - Compilation et Déploiement des Programmes Anchor
deploy_anchor_programs() {
  echo "==== Compilation et Déploiement des Programmes Anchor ===="

  # Aller dans le répertoire d'Anchor
  cd "${ANCHOR_DIR}"

  # 1. Compilation des programmes Anchor
  echo "🔧 Compilation des programmes Anchor..."
  anchor build

  # 2. Déploiement des programmes gérés par Anchor
  echo "🔑 Déploiement d'AnnAHeim..."
  anchor deploy --program-name AnnAHeim

  echo "🗳️ Déploiement de onchain-voting..."
  anchor deploy --program-name onchain-voting

  echo "🌐 Déploiement de sns-integration..."
  anchor deploy --program-name sns-integration

  # (Optionnel) Initialiser les comptes Solana avec un script TypeScript
  echo "📂 Initialisation des comptes avec deploy.ts..."
  ts-node migrations/deploy.ts

  echo "==== Fin des étapes Anchor ===="
}

# Étape 2 - Déploiement d'un programme Solana indépendant (si nécessaire)
deploy_custom_programs() {
  echo "==== Déploiement des Programmes Solana Indépendants ===="
  deploy_solana_program "${ANCHOR_DIR}/