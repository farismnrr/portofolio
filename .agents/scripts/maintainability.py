#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASELINE = ROOT / ".agents" / "maintainability" / "portfolio.json"
SOURCE_ROOT = ROOT / "src"
SOURCE_MAX_LINES = 400
MAX_CODE_FILES_PER_DIRECTORY = 15
CODE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".vue", ".scss", ".css"}
IGNORED_PARTS = {"node_modules", "generated", "dist", ".ssr", "coverage", "playwright-report", "test-results"}
BYPASS = re.compile(r"biome-ignore|@ts-ignore|@ts-nocheck|@ts-expect-error")


def usage() -> int:
    print("usage: python3 .agents/scripts/maintainability.py portfolio [--write-baseline]", file=sys.stderr)
    return 64


def is_test(path: Path) -> bool:
    value = "/" + path.as_posix().lower() + "/"
    name = path.name.lower()
    return any(part in value for part in ("/test/", "/tests/", "/e2e/", "/__tests__/")) or name.endswith(
        (".test.ts", ".test.tsx", ".spec.ts", ".spec.tsx")
    )


def collect() -> dict[str, object]:
    oversized: dict[str, int] = {}
    dense: dict[str, int] = {}
    bypasses: dict[str, int] = {}
    directory_counts: dict[str, int] = {}
    scanned = 0

    for path in SOURCE_ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in CODE_SUFFIXES:
            continue
        rel = path.relative_to(ROOT)
        if any(part in IGNORED_PARTS for part in rel.parts) or is_test(rel):
            continue
        scanned += 1
        text = path.read_text(errors="replace")
        lines = len(text.splitlines())
        if lines > SOURCE_MAX_LINES:
            oversized[rel.as_posix()] = lines
        count = len(BYPASS.findall(text))
        if count:
            bypasses[rel.as_posix()] = count
        directory = rel.parent.as_posix()
        directory_counts[directory] = directory_counts.get(directory, 0) + 1

    dense = {key: value for key, value in directory_counts.items() if value > MAX_CODE_FILES_PER_DIRECTORY}
    return {
        "version": 1,
        "limits": {
            "source_max_lines": SOURCE_MAX_LINES,
            "max_code_files_per_directory": MAX_CODE_FILES_PER_DIRECTORY,
        },
        "oversized_files": dict(sorted(oversized.items())),
        "dense_directories": dict(sorted(dense.items())),
        "inline_bypasses": dict(sorted(bypasses.items())),
        "scanned_files": scanned,
    }


def compare(observed: dict[str, object], baseline: dict[str, object]) -> list[str]:
    errors: list[str] = []
    for field, label in (
        ("oversized_files", "oversized source file"),
        ("dense_directories", "dense source directory"),
        ("inline_bypasses", "inline quality bypass"),
    ):
        now = observed.get(field, {})
        before = baseline.get(field, {})
        if not isinstance(now, dict) or not isinstance(before, dict):
            errors.append(f"invalid maintainability baseline field: {field}")
            continue
        for path, value in now.items():
            ceiling = before.get(path, 0)
            if not isinstance(value, int) or not isinstance(ceiling, int) or value > ceiling:
                errors.append(f"{label} regressed: {path} observed={value} baseline={ceiling}")
    return errors


def main() -> int:
    if len(sys.argv) not in (2, 3) or sys.argv[1] != "portfolio":
        return usage()
    write_baseline = len(sys.argv) == 3 and sys.argv[2] == "--write-baseline"
    if len(sys.argv) == 3 and not write_baseline:
        return usage()

    observed = collect()
    if write_baseline:
        BASELINE.parent.mkdir(parents=True, exist_ok=True)
        BASELINE.write_text(json.dumps(observed, indent=2) + "\n")
        print(f"maintainability baseline written: {BASELINE.relative_to(ROOT)}")
        return 0

    if not BASELINE.exists():
        print(f"missing maintainability baseline: {BASELINE.relative_to(ROOT)}", file=sys.stderr)
        return 1
    baseline = json.loads(BASELINE.read_text())
    errors = compare(observed, baseline)
    if errors:
        print("maintainability ratchet failed: portfolio", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"maintainability ratchet passed: portfolio ({observed['scanned_files']} files scanned)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
