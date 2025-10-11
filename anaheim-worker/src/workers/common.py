# common.py
import threading
import queue
from ...utils.worker_common import log, repo_open, create_branch_if_missing, shutdown_event

# file-global vars
llm_queue = queue.Queue()
