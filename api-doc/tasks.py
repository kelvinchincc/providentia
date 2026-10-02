import glob
import os
import subprocess
import sys

from invoke.context import Context
from invoke.tasks import task


@task(help={"file": "Specify a .hurl file to run. If not provided, a file will be selected using fzf."})
def run(_ctx: Context, file=None):
    """Run hurl with .env variables. Pass extra flags with -- separator: inv run -- --verbose"""
    files = get_sorted_hurl_files()

    if not files:
        print("No .hurl files found")
        return

    selected = file or select_file(files)
    if not selected:
        return

    trailing_args = []
    try:
        separator_index = sys.argv.index("--")
        trailing_args = sys.argv[separator_index + 1 :]
    except ValueError:
        pass

    cmd = ["hurl", "--variables-file", ".env", selected] + trailing_args
    result = subprocess.run(cmd, check=True)
    sys.exit(result.returncode)


@task(help={"json": "Process JSON with jq before opening in Zed"})
def zed(_ctx: Context, json=False):
    """Launch Zed in stdin mode"""
    if json:
        result = subprocess.run("jq .", input=sys.stdin.read(), text=True, capture_output=True, check=True)
        if result.returncode != 0:
            print("jq failed to process the input")
            sys.exit(result.returncode)

        result = subprocess.run("zed -e -", input=result.stdout, text=True, check=True)
    else:
        sys.exit(subprocess.run("zed -e -", check=True).returncode)


def get_sorted_hurl_files():
    """Get .hurl files sorted by modification time (newest first)"""
    files = glob.glob("**/*.hurl", recursive=True)

    return sorted(files, key=lambda f: -os.path.getmtime(f))


def select_file(files):
    """Select a file using fzf"""
    try:
        result = subprocess.run(
            ["fzf", "--ansi"],
            input="\n".join(files),
            text=True,
            capture_output=True,
            check=True,
        )
        return result.stdout.strip() if result.stdout else None
    except FileNotFoundError:
        print("fzf not found")
        return None
