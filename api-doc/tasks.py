import glob
import os
import subprocess
import sys

from invoke.context import Context
from invoke.tasks import task


@task(
    help={
        "file": "Specify a .hurl file to run. If not provided, a file will be selected using fzf.",
        "env": """Specifiy additional .env files to load. Example: --env .env.local,.env.test, note that .env is always
loaded in all cases""",
        "vars": "Specify additional variables to load. Example: --vars VAR1=value1,VAR2=value2",
        "verbose": "Enable verbose output",
    },
    iterable=["env", "vars"],
)
def run(_ctx: Context, file=None, env=None, vars=None, verbose=False):
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

    env_files = env if env is not None else [".env"]
    env_files = [["--variables-file", f] for f in env_files]
    variables: list[list[str]] = [
        ["--variable", var] for var in (vars if vars is not None else [])
    ]
    cmd = [
        "hurl",
        *(["--verbose"] if verbose else []),
        "--variables-file",
        ".env",
        *[arg for sublist in env_files for arg in sublist],
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


@task()
def login(_ctx: Context):
    """
    Login and update the .env file with the new token

    Grab the auth and refresh tokens from the cookie header and update the .env file with the new tokens, which is the
    AUTH and REFRESH variables, using the credentials from _store/cred.ini.
    """

    # inv run -f auth/login.hurl -e _store/cred.ini -- -i
    # run command and capture the output
    result = subprocess.run(
        ["inv", "run", "-f", "auth/login.hurl", "-e", "_store/cred.ini", "--", "-i"],
        capture_output=True,
        text=True,
        check=True,
    )

    # parse the ouput to get the auth and refresh tokens from the cookie header in set-cookie header
    cookie_header: list[str] = []

    for line in result.stdout.splitlines():
        if line.startswith(("Set-Cookie:", "set-cookie:")):
            cookie_header.append(line)

    parsed_cookie_header = [
        parse_cookie(line.split(":", 1)[1].strip()) for line in cookie_header
    ]
    parsed_cookie_header = {k: v for d in parsed_cookie_header for k, v in d.items()}
    print(f"Auth cookies: {parsed_cookie_header}")

    env_file = ".env"
    with open(env_file, "r") as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            if line.startswith("AUTH="):
                lines[i] = f"AUTH={parsed_cookie_header.get('auth', '')}\n"
            elif line.startswith("REFRESH="):
                lines[i] = f"REFRESH={parsed_cookie_header.get('refresh', '')}\n"

        with open(env_file, "w") as f:
            f.writelines(lines)


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


def parse_cookie(cookie: str):
    """
    Parse a cookie string eg auth=token;... into dictionary of key-value pairs, and give up the data after ';'
    """

    cookie_dict = {}
    parts = cookie.split("=")
    key = parts[0].strip()
    value = parts[1].split(";")[0].strip() if len(parts) > 1 else ""
    cookie_dict[key] = value
    return cookie_dict
