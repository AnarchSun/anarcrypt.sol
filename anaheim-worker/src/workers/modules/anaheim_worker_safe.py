# src/workers/modules/anaheim_worker_safe.py
import os
import queue
import threading
import time
from pathlib import Path
from typing import List, Optional, Union

from git import Repo, GitCommandError
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

# -----------------------
# Globals
# -----------------------
PROJECT_PATH = Path(os.getenv("REPO_PATH", "/home/anarchsun/RustroverProjects/anarcrypt.sol/anaheim-worker")).resolve()
DIAGNOSTICS_DIR = PROJECT_PATH / "diagnostics"
DIAGNOSTICS_DIR.mkdir(exist_ok=True)
COPILOT_DELEGATIONS_LOG = DIAGNOSTICS_DIR / "copilot_delegations.log"
FLOOD_BRANCH = "<flood>"

llm_queue: queue.Queue[Union[str, dict]] = queue.Queue()
shutdown_event = threading.Event()

# -----------------------
# Logging
# -----------------------
def log(msg: str):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[worker-safe][{ts}] {msg}"
    print(line)
    try:
        with open(PROJECT_PATH / "worker_safe.log", "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass

def handle_ts_error(ts_error: dict):
    """Transforme et applique un TS error via apply_ts_actions"""
    apply_ts_actions([ts_error])
    log(f"🛠 TS error handled: {ts_error.get('message', ts_error)}")

# -----------------------
# Repo helpers
# -----------------------
def repo_open() -> Optional[Repo]:
    try:
        return Repo(PROJECT_PATH)
    except Exception as e:
        log(f"❌ Failed to open repo: {repr(e)}")
        return None

def create_branch_if_missing(repo: Repo, branch_name: str):
    if branch_name not in repo.branches:
        repo.git.branch(branch_name)
        log(f"🌿 Created branch {branch_name}")

def commit_all(repo: Repo, message: str):
    try:
        repo.git.add(all=True)
        repo.index.commit(message)
        log(f"✅ Committed: {message}")
    except GitCommandError as e:
        log(f"⚠️ Commit failed: {repr(e)}")

def flush_to_flood(repo: Repo, branch_name: str):
    try:
        if FLOOD_BRANCH not in repo.branches:
            repo.git.branch(FLOOD_BRANCH)
        repo.git.checkout(FLOOD_BRANCH)
        try:
            repo.git.merge(branch_name, "--no-ff", "--strategy-option=theirs")
        except GitCommandError:
            repo.git.merge("--abort")
            log(f"⚠️ Merge conflict during flush_to_flood on {branch_name}")
            return
        commits = list(repo.iter_commits(FLOOD_BRANCH))
        if len(commits) > 250:
            repo.git.reset("--hard", commits[249].hexsha)
            log("♻️ FLOOD branch trimmed to 250 commits")
        repo.git.push("--set-upstream", "origin", FLOOD_BRANCH)
        log(f"🌊 FLOOD branch updated with {branch_name}")
    except Exception as e:
        log(f"💥 flush_to_flood failed: {repr(e)}")

# -----------------------
# Patch / TS logic
# -----------------------
def ask_llm(prompt: str) -> str:
    log(f"🤖 ask_llm called with prompt: {prompt[:100]}...")
    return "[]"

def apply_patch(patch: dict):
    file_path = Path(patch.get("file", ""))
    if not file_path.exists():
        log(f"❌ File not found: {file_path}")
        return False
    code = file_path.read_text(encoding="utf-8")
    ptype = patch.get("type")
    if ptype == "insert_import":
        symbol = patch.get("symbol")
        if symbol not in code:
            code = f"import {{ {symbol} }} from './{file_path.stem}';\n" + code
    elif ptype == "create_function":
        symbol = patch.get("symbol")
        code += f"\nexport function {symbol}(...args: any[]) {{ throw new Error('Not implemented'); }}\n"
    file_path.write_text(code, encoding="utf-8")
    log(f"✅ Patch applied: {ptype} -> {file_path}")
    return True

def apply_ts_actions(actions: List[dict]):
    for patch in actions:
        apply_patch(patch)

# -----------------------
# Worker threads
# -----------------------
def worker_thread_cycle(task_source_queue: queue.Queue):
    while not shutdown_event.is_set():
        try:
            task = task_source_queue.get(timeout=2)
            if isinstance(task, dict):
                apply_ts_actions([task])
            task_source_queue.task_done()
        except queue.Empty:
            continue
        except Exception as e:
            log(f"💥 Worker error: {repr(e)}")

def copilot_retrier(interval: int = 120):
    while not shutdown_event.is_set():
        try:
            if not COPILOT_DELEGATIONS_LOG.exists():
                time.sleep(interval)
                continue
            content = COPILOT_DELEGATIONS_LOG.read_text(encoding="utf-8").strip()
            if not content:
                time.sleep(interval)
                continue
            entries = [b.strip() for b in content.split("-"*60) if b.strip()]
            for block in entries:
                ts_error = {"file": "<unknown>", "message": block[:80], "type": "create_function", "symbol": "LLMGenerated"}
                apply_ts_actions([ts_error])
            time.sleep(interval)
        except Exception as e:
            log(f"💥 copilot_retrier error: {repr(e)}")
            time.sleep(interval)

# -----------------------
# Hot reload
# -----------------------
class TSErrorHandler(FileSystemEventHandler):
    def __init__(self, repo: Repo):
        self.repo = repo

    def on_modified(self, event):
        if event.src_path.endswith(".ts"):
            log(f"📂 Detected TS modification: {event.src_path}")
            llm_queue.put({"file": event.src_path, "type": "create_function", "symbol": "HotReloadStub"})

def start_hot_reload(repo: Repo, watch_path: str = "."):
    observer = Observer()
    observer.schedule(TSErrorHandler(repo), path=watch_path, recursive=True)
    observer.start()
    log(f"🛰️ Hot reload started on {watch_path}")
    return observer

# -----------------------
# Auto TS fix with buffer
# -----------------------
def auto_ts_fix_cycle_safe(repo_obj: Optional[Repo],
                           last_commit_time: float,
                           min_commit_interval: int = 300,
                           target_branch: str = "Orion",
                           action_buffer: Optional[List[dict]] = None) -> tuple[List[dict], float]:

    applied_actions: List[dict] = []  # placeholder
    if action_buffer is None:
        action_buffer = []

    if not applied_actions:
        return applied_actions, last_commit_time

    action_buffer.extend(applied_actions)
    now_ts = time.time()
    if repo_obj and (now_ts - last_commit_time >= min_commit_interval) and action_buffer:
        try:
            create_branch_if_missing(repo_obj, target_branch)
            repo_obj.git.checkout(target_branch)
            commit_all(repo_obj, f"Auto TS update - {len(action_buffer)} actions")
            flush_to_flood(repo_obj, target_branch)
            last_commit_time = now_ts
            action_buffer.clear()
        except Exception as e:
            log(f"⚠️ Commit failed: {repr(e)}")
    return applied_actions, last_commit_time

# -----------------------
# Main worker
# -----------------------
def main_worker_safe_hyper(num_threads: int = 4):
    repo_obj = repo_open()
    if not repo_obj:
        log("❌ Repo not available, exiting.")
        return

    buffers = {"Orion": [], "Orion-Exploration": []}
    last_commit_times = {"Orion": 0.0, "Orion-Exploration": 0.0}

    # Threads
    threads = [threading.Thread(target=worker_thread_cycle, args=(llm_queue,), name=f"worker-{i+1}", daemon=True)
               for i in range(num_threads)]
    for t in threads:
        t.start()
        log(f"🧵 Started {t.name}")

    retrier_thread = threading.Thread(target=copilot_retrier, daemon=True)
    retrier_thread.start()
    log("🛰️ Copilot retrier started.")

    observer = start_hot_reload(repo_obj, str(PROJECT_PATH))

    try:
        while not shutdown_event.is_set():
            for branch in ["Orion", "Orion-Exploration"]:
                applied_actions, last_commit_times[branch] = auto_ts_fix_cycle_safe(
                    repo_obj=repo_obj,
                    last_commit_time=last_commit_times[branch],
                    target_branch=branch,
                    action_buffer=buffers[branch]
                )
                if applied_actions:
                    log(f"🛠 {branch} applied {len(applied_actions)} actions.")
            time.sleep(10)
    except KeyboardInterrupt:
        shutdown_event.set()
    finally:
        shutdown_event.set()
        observer.stop()
        observer.join()
        for t in threads:
            t.join(timeout=2)
        retrier_thread.join(timeout=2)
        log("✅ Hyper safe worker stopped cleanly.")

if __name__ == "__main__":
    main_worker_safe_hyper(num_threads=4)
