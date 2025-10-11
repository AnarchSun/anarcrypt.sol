# PATH: src/workers/modules/anarcrypt_worker_debug.py
#!/usr/bin/env python3

# Imports depuis modules centralisés
from workers.modules import (
    repo_open,
    apply_ts_actions,
    log,
    handle_ts_error,
    auto_ts_fix_cycle_safe,
)

# -----------------------
# Stubs LLM & Playwright
# -----------------------
def ask_llm_stub() -> str:
    log("💡 LLM simulated: returning empty string")
    return ""

def devtools_check_stub():
    log("💡 Playwright simulated: skipped")

# -----------------------
# Debug / Dry-run main
# -----------------------
def debug_main(dry_run: bool = True):
    log("🛠️ Anaheim Worker DEBUG iteration started")
    repo = repo_open()
    if not repo:
        log("❌ Repo not available, aborting debug run.")
        return

    buffers = {"Orion": [], "Orion-Exploration": []}
    last_commit_times = {"Orion": 0.0, "Orion-Exploration": 0.0}

    # 1️⃣ TypeScript simulation
    ts_error_stub = {"file": "<unknown>", "type": "create_function", "symbol": "DebugStub"}
    apply_ts_actions([ts_error_stub])
    log("✅ Stub TS action applied")

    # 2️⃣ Collect errors & LLM analysis
    ts_errors = [ts_error_stub]
    for err in ts_errors:
        handle_ts_error(err)
    log(f"✅ Handled {len(ts_errors)} TS errors")

    # 3️⃣ Playwright / DevTools
    if dry_run:
        devtools_check_stub()
    else:
        log("💡 Real Playwright check skipped in debug")

    # 4️⃣ Auto TS fix cycle simulation
    for branch in ["Orion", "Orion-Exploration"]:
        applied_actions, last_commit_times[branch] = auto_ts_fix_cycle_safe(
            repo_obj=repo,
            last_commit_time=last_commit_times[branch],
            target_branch=branch,
            action_buffer=buffers[branch]
        )
        if applied_actions:
            log(f"🛠 {branch} applied {len(applied_actions)} actions.")

    log("🛑 DEBUG iteration finished")

# -----------------------
# Entry point
# -----------------------
if __name__ == "__main__":
    debug_main(dry_run=True)
