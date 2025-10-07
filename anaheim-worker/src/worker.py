import os, subprocess, json, time, hashlib
from db import init_db, add_or_increment, get_fix, export_json
from parser_utils import parse_tsc, parse_eslint_json, parse_cargo
from llm_interface import ask_llm
from github_search import search_code
from git_utils import repo_open, create_branch_if_missing, commit_all
from playwright_runner import run_checks

CFG_PATH = "config/worker_config.yml"
import yaml
cfg = yaml.safe_load(open(CFG_PATH))

REPO = os.getenv("REPO_PATH", cfg.get("repo_path","/work/project"))
BRANCH = os.getenv("WORKER_BRANCH", cfg.get("worker_branch","Orion"))
REPEAT_THRESHOLD = cfg.get("repeat_threshold",2)
ROOTS_THRESHOLD = cfg.get("roots_error_threshold",6)

init_db()

def run_cmd(cmd, cwd=REPO, timeout=600):
    try:
        p = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout + "\n" + p.stderr
    except Exception as e:
        return -1, str(e)

def fingerprint_error(err):
    return hashlib.sha256(json.dumps(err, sort_keys=True).encode('utf-8')).hexdigest()

def analyze_and_fix(errors):
    for e in errors:
        key = fingerprint_error(e)
        prev = get_fix()
        if prev:
            # increment attempts
            add_or_increment()
            print("Found cached fix, skipping LLM")
            continue

        # Ask LLM for a patch
        prompt = f"Error:\n{json.dumps(e,indent=2)}\nFile content (if available): Provide a minimal patch or full file replacement and short explanation. If deprecated, suggest replacements and possible GitHub examples."
        resp = ask_llm(prompt, timeout=90)
        # store result in DB
        add_or_increment()
        # If LLM mentions deprecated, try github search
        if "deprecated" in resp.lower() or "replacement" in resp.lower():
            term = e.get("msg","")
            try:
                hits = search_code(term)
                # append hits summary into the saved fix file
                # (we simply save to disk for review)
                with open(f"/work/data/patches/patch_{key}.txt","w",encoding="utf-8") as f:
                    f.write(resp+"\n\n# GH candidates:\n")
                    for h in hits[:10]:
                        f.write(f"{h['repo']} {h['path']} {h['url']}\n")
            except Exception as ex:
                print("Github search failed",ex)
        else:
            with open(f"/work/data/patches/patch_{key}.txt","w",encoding="utf-8") as f:
                f.write(resp)

def collect_errors():
    # build
    rc, out = run_cmd("pnpm build || pnpm run build || true")
    tsc = parse_tsc(out)
    # lint (json)
    rc2, lint_out = run_cmd("pnpm lint -f json || true")
    eslint = parse_eslint_json(lint_out)
    # cargo build
    rc3, cargo_out = run_cmd("cargo build || true")
    cargo = parse_cargo(cargo_out)
    # combine
    errs = tsc + eslint + cargo
    return errs, out + "\n" + lint_out + "\n" + cargo_out

def apply_strategy_and_commit(repo, errs):
    # export DB snapshot
    export_json()

    # create branch if missing
    create_branch_if_missing(repo, BRANCH)
    repo.git.checkout(BRANCH)

    # decide target: if errors <= ROOTS_THRESHOLD => push to Roots else Orion (we're on Orion by default)
    target_branch = BRANCH
    if len(errs) <= ROOTS_THRESHOLD:
        target_branch = "Roots"

    # commit
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    summary = f"Auto update {ts} - errors:{len(errs)}"
    commit_all(repo, summary)
    try:
        repo.git.push('--set-upstream','origin', target_branch)
    except Exception as e:
        print("push failed", e)

def devtools_check():
    pages = cfg.get("playwright",{}).get("pages",[])
    selectors = cfg.get("playwright",{}).get("click_selectors",[])
    try:
        run_checks(pages, selectors, out_path="/work/data/dev_errors.json")
    except Exception as e:
        print("playwright failed", e)

def main_loop():
    repo = repo_open(REPO)
    while True:
        errs, raw = collect_errors()
        print(f"Found {len(errs)} errors")
        # dedupe errors and count repetition
        to_handle=[]
        for e in errs:
            key = fingerprint_error(e)
            to_handle.append(e)
        if to_handle:
            analyze_and_fix(to_handle)
        # devtools
        devtools_check()
        # commit & push strategy
        apply_strategy_and_commit(repo, errs)
        # export DB
        export_json()
        time.sleep(300)

if __name__=="__main__":
    main_loop()
