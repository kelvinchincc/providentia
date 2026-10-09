import glob
import os
import subprocess
import sys

from invoke.context import Context
from invoke.tasks import task


@task(
    help={
        "file": "Specify a .hurl file to run. If not provided, a file will be selected using fzf.",
        "vars": "Specify additional variables to load. Example: --vars VAR1=value1,VAR2=value2",
        "verbose": "Enable verbose output",
        "headers": "Show request and response headers",
        "save": "Save the response to a file, right beside the .hurl file with a .response extension",
        "curl": "Output the equivalent curl command to a file, right beside the .hurl file with a .sh extension",
    },
    iterable=["vars"],
)
def run(
    _ctx: Context,
    file=None,
    vars=None,
    verbose=False,
    headers=False,
    save=False,
    curl=False,
):
    """Run hurl with .env variables. Pass extra flags with -- separator: inv run -- --verbose"""
    files = get_sorted_hurl_files()

    if not files:
        print("No .hurl files found")
        return

    selected = file or select_file(files)
    if not selected:
        return

    if save:
        verbose = True

    trailing_args = []
    try:
        separator_index = sys.argv.index("--")
        trailing_args = sys.argv[separator_index + 1 :]
    except ValueError:
        pass

    env_files = discover_env_files(selected)
    env_file_args = [["--variables-file", f] for f in env_files]
    variables: list[list[str]] = [
        ["--variable", var] for var in (vars if vars is not None else [])
    ]
    cmd = [
        "hurl",
        *(["--verbose"] if verbose else []),
        *(["--include"] if headers else []),
        *(["--pretty"] if save else []),
        *[arg for sublist in env_file_args for arg in sublist],
        *[arg for sublist in variables for arg in sublist],
        selected,
    ]

    if curl:
        curl_file = os.path.splitext(selected)[0] + ".sh"
        cmd.extend(["--curl", curl_file])

    cmd.extend(trailing_args)

    if save:
        response_file = os.path.splitext(selected)[0] + ".saved.jsonc"
        result = run_cmd(cmd, capture_output=True)
        save_response(response_file, f"{result.stderr}\n\n{result.stdout}")
    elif curl:
        run_cmd(cmd, capture_output=True)
    else:
        run_cmd(cmd)


@task(help={"json": "Process JSON with jq before opening in Zed"})
def zed(_ctx: Context, json=False):
    """Launch Zed in stdin mode"""
    if json:
        jq_result = subprocess.run(
            ["jq", "."],
            capture_output=True,
            text=True,
            check=True,
        )
        subprocess.run(
            ["zed", "-e", "-"],
            input=jq_result.stdout,
            text=True,
            check=True,
        )
    else:
        run_cmd(["zed", "-e", "-"], exit_on_error=True)


# BEGIN HELPER FUNCTIONS
def process_response_output(output: str) -> str:
    """Comment out HTTP headers before JSON content in output."""
    lines = output.split("\n")
    processed_lines = []
    json_start_index = None

    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith(("[", "{")):
            json_start_index = i
            break

    for i, line in enumerate(lines):
        if json_start_index is not None and i < json_start_index:
            if line.strip() and not line.strip().startswith("//"):
                processed_lines.append("//| " + line)
            else:
                processed_lines.append(line)
        else:
            processed_lines.append(line)

    return "\n".join(processed_lines)


def save_response(file_path: str, output: str):
    """Save processed response to JSONC file."""
    processed = process_response_output(output)
    with open(file_path, "w") as f:
        f.write(processed)


def discover_env_files(selected_file):
    """Discover .env files from project root to the selected file's directory.

    Walks up from the selected file until finding tasks.py (project root),
    then collects all .env files along the path from root to the file's directory,
    ordered from root to leaf.
    """
    file_path = os.path.abspath(selected_file)
    file_dir = os.path.dirname(file_path)

    # Find project root by walking up until we find tasks.py
    current_dir = file_dir
    project_root = None

    while True:
        if os.path.exists(os.path.join(current_dir, "tasks.py")):
            project_root = current_dir
            break
        parent = os.path.dirname(current_dir)
        if parent == current_dir:  # Reached filesystem root
            break
        current_dir = parent

    if not project_root:
        return []

    # Build list of all directories from root to file_dir
    rel_path = os.path.relpath(file_dir, project_root)
    if rel_path == ".":
        dirs = [project_root]
    else:
        dirs = [project_root]
        path_parts = rel_path.split(os.sep)
        for part in path_parts:
            dirs.append(os.path.join(dirs[-1], part))

    # Collect .env files from root to file_dir
    env_files = []
    for dir_path in dirs:
        env_path = os.path.join(dir_path, ".env")
        if os.path.exists(env_path):
            env_files.append(env_path)

    return env_files


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


def run_cmd(cmd: list[str], exit_on_error=None, capture_output=False):
    """Run a command and return the result. If exit_on_error is True, exit on error."""
    try:
        result = subprocess.run(
            cmd, check=True, capture_output=capture_output, text=True
        )
        return result
    except subprocess.CalledProcessError as e:
        if exit_on_error or exit_on_error is None:
            sys.exit(e.returncode)
        return e


# END HELPER FUNCTIONS
