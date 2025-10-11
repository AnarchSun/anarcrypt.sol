# Anaheim Worker

Anaheim Worker est le moteur central d’autogestion et d’autofix de votre projet **anarcrypt.sol**.  
Il combine gestion Git, patches TypeScript, simulation LLM et hot reload pour automatiser le développement et le debugging.

---

## Chemin du projet

Par défaut, le chemin du projet est :

path: anarcrypt.sol/anaheim-worker


Ce chemin est utilisé dans le code comme `PROJECT_PATH` et sert de racine pour :

- les scripts TypeScript,
- les logs et diagnostics (`diagnostics/`),
- le hot reload,
- les commits automatiques vers les branches `Orion` et `FLOOD`.

---

## Structure des modules

Le dossier `src/workers/modules/` contient :

- `anaheim_worker_safe.py` : Worker sécurisé et hyper safe pour le déploiement en continu.
- `anarcrypt_worker_debug.py` : Mode debug / dry-run pour tester les patches TS et la logique sans commit.
- `hyper_optimal_worker.py` : Version hyper optimisée pour exécuter rapidement les cycles TS / LLM / Git.
- `worker_fastloop.py` : Boucle rapide pour testing, avec simulation de LLM et Playwright.

Chaque module importe les fonctions centrales depuis `workers.modules` pour :

- `PROJECT_PATH` : Chemin du projet.
- `repo_open()` : Ouvre le dépôt Git.
- `apply_ts_actions(actions)` : Applique des patches TypeScript.
- `handle_ts_error(err)` : Gère un TS error via `apply_ts_actions`.
- `auto_ts_fix_cycle_safe(...)` : Cycle automatique de corrections TS.
- `log(msg)` : Log interne dans le terminal et fichier `worker_safe.log` ou `hyper_worker.log`.

---

## Installation / Pré-requis

1. Cloner le projet :
```bash
git clone https://github.com/votre-repo/anarcrypt.sol.git
cd anarcrypt.sol/anaheim-worker
