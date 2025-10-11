# worker_full.py (optimisé)
import os, time, json, hashlib, subprocess
from pathlib import Path
from typing import Optional, List, Union
from git import Repo, InvalidGitRepositoryError, GitCommandError

# Local modules
from db import init_db, export_json, add_or_increment, get_fix
from git_utils import create_branch_if_missing, commit_all
from github_search import search_code
from playwright_runner import run_checks
from llm_interface import ask_llm
from parser_utils import parse_tsc, parse_eslint_json, parse_cargo

# -----------------------
# Config centralisé
# -----------------------
class Config:
    REPO_PATH = Path(os.getenv("REPO_PATH", "/home/anarchsun/RustroverProjects/anarcrypt.sol/anaheim-worker/anaheim-putsch-self-governance-solana-dapp")).resolve()
    DB_PATH = Path(os.getenv("DB_PATH", REPO_PATH.parent / "data/memory.sqlite")).resolve()
    BRANCH = os.getenv("WORKER_BRANCH", "Orion")
    ROOTS_THRESHOLD = 6
    REPEAT_THRESHOLD = 2
    LOG_FILE = REPO_PATH.parent / "logs/anaheim_worker.log"
    GOV_PATH = Path(os.getenv("GOV_PATH", REPO_PATH.parent / "governance")).resolve()
    FLOOD_BRANCH = "<flood>"

cfg = Config()
cfg.LOG_FILE.parent.mkdir(exist_ok=True)

# -----------------------
# Logging
# -----------------------
def log(msg: str):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    try: cfg.LOG_FILE.open("a").write(line + "\n")
    except: pass

# -----------------------
# Repo helpers
# -----------------------
def repo_open() -> Optional[Repo]:
    try: return Repo(cfg.REPO_PATH)
    except InvalidGitRepositoryError as e:
        log(f"❌ Repo invalide: {e}"); return None

# -----------------------
# Command & fingerprint
# -----------------------
def run_cmd(cmd, cwd=cfg.REPO_PATH, timeout=600):
    try: p=subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=timeout); return p.returncode, p.stdout+p.stderr
    except Exception as e: return -1, str(e)

def fingerprint_error(err: dict): return hashlib.sha256(json.dumps(err, sort_keys=True).encode("utf-8")).hexdigest()

# -----------------------
# TS / Resolver / LLM
# -----------------------
def run_tsc(paths=None):
    paths = paths or [cfg.REPO_PATH]
    log(f"🔧 Running TSC on {paths}")
    combined_log = cfg.REPO_PATH / "ts-errors.log"
    with combined_log.open("w") as f:
        for path in paths:
            subprocess.run(["npx","tsc","--noEmit"], cwd=path, stdout=f, stderr=subprocess.STDOUT)
    return combined_log

def run_resolver(errors_file: Path): return []

def apply_ts_actions(actions: List[dict]):
    for a in actions: log(f"🔧 Applying action: {a.get('action','unknown')}")

def analyze_and_fix(errors: List[dict]):
    for e in errors:
        key = fingerprint_error(e)
        if get_fix(): add_or_increment(); continue
        resp = ask_llm(f"Error:\n{json.dumps(e,indent=2)}\nProvide minimal patch or replacement.", _timeout=90)
        add_or_increment()
        patch_path = cfg.DB_PATH.parent / f"patches/patch_{key}.txt"; patch_path.parent.mkdir(exist_ok=True); patch_path.write_text(resp)
        if "deprecated" in resp.lower() or "replacement" in resp.lower():
            try:
                hits = search_code(e.get("msg",""))
                with patch_path.open("a") as f: f.write("\n# GH candidates:\n"+ "\n".join([f"{h['repo']} {h['path']} {h['url']}" for h in hits[:10]]))
            except Exception as ex: log(f"⚠️ Github search failed: {ex}")

def collect_errors():
    paths = [cfg.REPO_PATH] + ([cfg.GOV_PATH] if cfg.GOV_PATH.exists() else [])
    ts_file = run_tsc(paths); ts_actions = run_resolver(ts_file); apply_ts_actions(ts_actions)
    rc, build_out = run_cmd("pnpm build || pnpm run build || true")
    rc2, lint_out = run_cmd("pnpm lint -f json || true")
    rc3, cargo_out = run_cmd("cargo build || true")
    errs = parse_tsc(build_out) + parse_eslint_json(lint_out) + parse_cargo(cargo_out)
    return errs, build_out + "\n" + lint_out + "\n" + cargo_out

def devtools_check():
    try: run_checks(cfg.REPO_PATH, cfg.REPO_PATH, out_path=cfg.DB_PATH.parent / "dev_errors.json")
    except Exception as ex: log(f"Playwright failed: {ex}")

# -----------------------
# Commit / auto-fix
# -----------------------
def apply_strategy_and_commit(repo, errs):
    if repo is None: log("⚠️ Repo missing"); return
    export_json(); create_branch_if_missing(repo, cfg.BRANCH); repo.git.checkout(cfg.BRANCH)
    target = "Roots" if len(errs)<=cfg.ROOTS_THRESHOLD else cfg.BRANCH
    commit_all(repo, f"Auto update {time.strftime('%Y-%m-%d %H:%M:%S')} - errors:{len(errs)}")
    try: repo.git.push("--set-upstream","origin", target)
    except Exception as e: log(f"Push failed: {e}")

def auto_ts_fix_cycle_safe(last_commit_time, target_branch): log(f"♻️ Auto TS fix cycle safe on {target_branch}"); return [], last_commit_time
def auto_ts_fix_cycle(*args, **kwargs): return auto_ts_fix_cycle_safe(*args, **kwargs)

# -----------------------
# Main loop
# -----------------------
def main_loop():
    repo = repo_open()
    log("🛠️ Anaheim Worker main_loop started")
    while True:
        try: errs,_ = collect_errors(); errs and analyze_and_fix(errs); devtools_check(); apply_strategy_and_commit(repo, errs); export_json()
        except Exception as ex: log(f"💥 Worker loop crashed: {ex}")
        time.sleep(300)

if __name__=="__main__": main_loop()
