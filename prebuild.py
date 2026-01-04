#!/usr/bin/python3

import argparse
import subprocess
import sys
import tomllib
from genericpath import exists
from os import mkdir, remove

parser = argparse.ArgumentParser()
parser.add_argument(
    "--clean", action="store_true", help="Clean the modules before running"
)
parser.add_argument(
    "--release", action="store_true", help="Clean the modules before running"
)
args = parser.parse_args()

IS_RELEASE = args.release
TARGET_DIR = "release" if IS_RELEASE else "debug"

MODULE_PREFIX = "lib" if sys.platform.startswith("linux") else ""
MODULE_EXT = ".so" if sys.platform.startswith("linux") else ".dll"

CORE_MODULES_WS_DIR = "./rust-vendor/core-modules"
CORE_MODULES_WS_TOML_LOC = f"{CORE_MODULES_WS_DIR}/Cargo.toml"

CORE_MODULES_BUILD_DIR = f"{CORE_MODULES_WS_DIR}/target/{TARGET_DIR}/"
MODULES_TARGET_DIR = "./src-tauri/modules/"


def reformat_name_to_lib_name(name: str):
    return f"{MODULE_PREFIX}{name.replace("-", "_")}{MODULE_EXT}"


def run_build_in_workspace_root():
    a = ["cargo", "build", "--release"] if IS_RELEASE else ["cargo", "build"]
    p = subprocess.Popen(a, cwd=CORE_MODULES_WS_DIR)
    p.wait()
    return


def run_clean_in_workspace_root():
    p = subprocess.Popen(["cargo", "clean"], cwd=CORE_MODULES_WS_DIR)
    p.wait()
    return


def get_modules_toml():
    with open(CORE_MODULES_WS_TOML_LOC, "rb") as f:
        return tomllib.load(f)


def get_sub_module_toml(target: str):
    with open(f"{CORE_MODULES_WS_DIR}/{target}/Cargo.toml", "rb") as f:
        return tomllib.load(f)


def is_valid_sub_module(toml: dict[str, any]):
    return toml["lib"]["crate-type"][0] == ("cdylib")


def get_modules():
    if not exists(CORE_MODULES_BUILD_DIR):
        run_build_in_workspace_root()

    config = get_modules_toml()
    members = [get_sub_module_toml(mem) for mem in config["workspace"]["members"]]
    members_ext = [
        {
            "name": mem["package"]["name"],
            "builds": reformat_name_to_lib_name(mem["package"]["name"]),
            "is_valid": is_valid_sub_module(mem),
            "object": mem,
        }
        for mem in members
    ]

    return [mem for mem in members_ext if mem["is_valid"]]


def install_built_module_if_exists(module_name: str):
    rfd = f"{CORE_MODULES_BUILD_DIR}/{module_name}"
    wfd = f"{MODULES_TARGET_DIR}/{module_name}"

    if not exists(MODULES_TARGET_DIR):
        mkdir(MODULES_TARGET_DIR)

    if not exists(rfd):
        print(f"[ERROR] Could not locate {module_name} in {CORE_MODULES_BUILD_DIR}")
        return

    if exists(wfd):
        remove(wfd)

    with open(rfd, "rb") as rf:
        with open(wfd, "wb") as wf:
            wf.writelines(rf.readlines())

    return


def main(clean):
    if clean:
        run_clean_in_workspace_root()

    modules = get_modules()
    for mod in modules:
        print(f"[INFO] Installing {mod["name"]} as {mod["builds"]}")
        install_built_module_if_exists(mod["builds"])

    return


if __name__ == "__main__":
    main(args.clean)
