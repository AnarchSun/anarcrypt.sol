# anarcrypt.sol/anaheim-worker/src/worker_full.py
import hashlib
import json
import os
import re
import subprocess
import time
from pathlib import Path

import yaml

from db import init_db, add_or_increment, get_fix, export_json
from git_utils import repo_open, create_branch_if_missing, commit_all
from github_search import search_code
from llm_interface import ask_llm
from parser_utils import parse_tsc, parse_eslint_json, parse_cargo
from playwright_runner import run_checks

# --- Définition du chemin absolu du fichier de config ---
REPO_PATH_FALLBACK = "/home/anarchsun/RustroverProjects/anarcrypt.sol/anaheim-worker/anaheim-putsch-self-governance-solana-dapp"

# Définition du chemin absolu du fichier de config
CFG_PATH = os.path.join(os.environ.get("REPO_PATH", REPO_PATH_FALLBACK), "../config/worker_config.yml")


# --- Chargement sécurisé de la configuration ---
try:
    with open(CFG_PATH, "r") as f:
        cfg = yaml.safe_load(f)
except FileNotFoundError:
    raise FileNotFoundError(f"❌ Fichier de config introuvable à : {CFG_PATH}")
except yaml.YAMLError as e:
    raise RuntimeError(f"⚠️ Erreur de parsing YAML dans {CFG_PATH} : {e}")

# --- Lecture des paramètres de config (ou valeurs par défaut) ---
REPO = os.getenv("REPO_PATH", cfg.get("repo_path", str(Path(__file__).resolve().parent.parent)))
GOV_PATH = os.getenv("GOV_PATH", cfg.get("gov_path", str(Path(REPO) / "governance")))
DB_PATH = os.getenv("DB_PATH", cfg.get("db_path", str(Path(__file__).resolve().parent.parent / "data" / "memory.sqlite")))
BRANCH = os.getenv("WORKER_BRANCH", cfg.get("worker_branch", "Orion"))
ROOTS_THRESHOLD = cfg.get("roots_error_threshold", 6)
ORION_THRESHOLD_ERRORS = cfg.get("orion_threshold_errors", 999)
REPEAT_THRESHOLD = cfg.get("repeat_threshold", 2)

PROJECT_PATH = Path(REPO)
governance_dir = Path(GOV_PATH)
all_files = list(governance_dir.glob("**/*.ts"))

# --- Log de vérification ---
print("🚀 Starting Anaheim Worker...")
print(f"📂 REPO_PATH={REPO}")
print(f"📂 GOV_PATH={GOV_PATH}")
print(f"📂 DB_PATH={DB_PATH}")
print(f"🌿 BRANCH={BRANCH}")
print(f"⚙️ ROOTS_THRESHOLD={ROOTS_THRESHOLD}")
print(f"🧠 ORION_THRESHOLD_ERRORS={ORION_THRESHOLD_ERRORS}")
print(f"🔁 REPEAT_THRESHOLD={REPEAT_THRESHOLD}")

if not PROJECT_PATH.exists():
    print(f"⚠️ Repo path not found: {PROJECT_PATH}")

init_db()

# -----------------------
# Git helper : vérifier ou créer branche
# -----------------------
def ensure_branch_exists(repo_path: str, branch_name: str, base_branch: str = "Roots"):
    try:
        os.chdir(repo_path)
        branches = subprocess.check_output(
            ["git", "branch", "--list", branch_name], text=True
        ).strip()

        if branch_name in branches:
            print(f"✅ Branche '{branch_name}' trouvée, checkout...")
            subprocess.run(["git", "checkout", branch_name], check=True)
        else:
            print(f"⚠️ Branche '{branch_name}' introuvable, création depuis '{base_branch}'...")
            subprocess.run(["git", "fetch", "origin", base_branch], check=True)
            subprocess.run(["git", "checkout", "-b", branch_name, f"origin/{base_branch}"], check=True)
            print(f"✨ Branche '{branch_name}' créée et checkout effectuée.")

        subprocess.run(["git", "pull", "origin", branch_name], check=True)
        print(f"🌿 Branche '{branch_name}' à jour.")

    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"❌ Erreur Git : {e}")

# --- Exécution automatique de la branche Git ---
ensure_branch_exists(REPO, BRANCH)

# -----------------------
# Helpers
# -----------------------
def run_cmd(cmd, cwd=PROJECT_PATH, timeout=600):
    try:
        p = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout + "\n" + p.stderr
    except Exception as e:
        return -1, str(e)

def fingerprint_error(err):
    return hashlib.sha256(json.dumps(err, sort_keys=True).encode('utf-8')).hexdigest()

# -----------------------
# TypeScript Resolver
# -----------------------
def run_tsc(paths=None):
    paths = paths or [PROJECT_PATH, governance_dir]
    combined_log = PROJECT_PATH / "ts-errors.log"
    with open(combined_log, "w") as f:
        for path in paths:
            subprocess.run(
                ["npx", "tsc", "--noEmit"],
                cwd=path,
                stdout=f,
                stderr=subprocess.STDOUT,
                check=False
            )
    return combined_log

def run_resolver(errors_file: Path):
    result = subprocess.run(
        ["node", "src/utils/resolver/index.js", str(errors_file)],
        cwd=PROJECT_PATH, capture_output=True, text=True, check=False
    )
    if result.stdout.strip():
        return json.loads(result.stdout)
    else:
        print("⚠️ Resolver n'a rien renvoyé:", result.stderr)
        return []

# ... le reste du code reste identique ...
# insert_import, create_function, patch_function_signature, patch_type_annotation, apply_ts_actions, analyze_and_fix, collect_errors, apply_strategy_and_commit, devtools_check, main_loop

if __name__ == "__main__":
    main_loop()
