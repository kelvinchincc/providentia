import csv
import glob
import os
import subprocess
import sys
from io import StringIO

from invoke.context import Context
from invoke.tasks import task


@task(
    help={
        "file": "Specify a .hurl file to run. If not provided, a file will be selected using fzf.",
        "env": "Specify a .env file to use for variables. Defaults to .env.",
        "vars": "Array of key=value pairs to set as environment variables. Example: --var FOO=bar,BAZ=qux",
    }
)
def run(_ctx: Context, file=None, env=".env", vars=None):
    """Run hurl with .env variables. Pass extra flags with -- separator: inv run -- --verbose"""
    files = get_sorted_hurl_files()
    parsed_vars = next(csv.reader(StringIO(vars if vars else ""), delimiter=","), [])

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

    variables: list[list[str]] = [["--variable", var] for var in parsed_vars]
    cmd = [
        "hurl",
        "--variables-file",
        env,
        *[arg for sublist in variables for arg in sublist],
        selected,
    ] + trailing_args
    run_cmd(cmd)


@task(help={"json": "Process JSON with jq before opening in Zed"})
def zed(_ctx: Context, json=False):
    """Launch Zed in stdin mode"""
    if json:
        run_cmd(["jq", "."], exit_on_error=True)
        run_cmd(["zed", "-e", "-"], exit_on_error=True)
    else:
        run_cmd(["zed", "-e", "-"], exit_on_error=True)


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


def run_cmd(cmd: list[str], exit_on_error=None):
    """Run a command and return the result. If exit_on_error is True, exit on error."""
    try:
        result = subprocess.run(cmd, check=True)
        return result
    except subprocess.CalledProcessError as e:
        if exit_on_error or exit_on_error is None:
            sys.exit(e.returncode)
        return e
