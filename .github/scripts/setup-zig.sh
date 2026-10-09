#!/usr/bin/env bash
set -euo pipefail

version="${ZIG_VERSION:-0.14.1}"
if [ "$version" != "0.14.1" ]; then
  echo "Unsupported Zig version: $version" >&2
  exit 1
fi

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64)
    archive="zig-x86_64-linux-${version}.tar.xz"
    sha256="24aeeec8af16c381934a6cd7d95c807a8cb2cf7df9fa40d359aa884195c4716c"
    ;;
  *)
    echo "Unsupported Zig host: $(uname -s)-$(uname -m)" >&2
    exit 1
    ;;
esac

add_to_path() {
  local dir="$1"
  if [ -n "${GITHUB_PATH:-}" ]; then
    printf '%s\n' "$dir" >> "$GITHUB_PATH"
  else
    export PATH="$dir:$PATH"
  fi
}

existing_zig="$(command -v zig 2>/dev/null || true)"
if [ -n "$existing_zig" ] && [ "$($existing_zig version 2>/dev/null || true)" = "$version" ]; then
  add_to_path "$(dirname "$existing_zig")"
  echo "Using existing Zig $version from $existing_zig"
  exit 0
fi

if [ -n "${RUNNER_TOOL_CACHE:-}" ]; then
  cached_zig="$RUNNER_TOOL_CACHE/zig/$version/x64/zig"
  if [ -x "$cached_zig" ] && [ "$($cached_zig version 2>/dev/null || true)" = "$version" ]; then
    add_to_path "$(dirname "$cached_zig")"
    echo "Using runner-cached Zig $version from $cached_zig"
    exit 0
  fi
fi

install_root="${ZIG_INSTALL_ROOT:-$HOME/.cache/portfolio-ci/zig}"
install_dir="$install_root/$version"
zig_bin="$install_dir/zig"

if [ ! -x "$zig_bin" ] || [ "$($zig_bin version 2>/dev/null || true)" != "$version" ]; then
  tmp_dir="$(mktemp -d)"
  trap 'rm -rf "$tmp_dir"' EXIT

  mkdir -p "$install_root"
  curl --fail --location --silent --show-error --retry 3 \
    "https://ziglang.org/download/${version}/${archive}" \
    --output "$tmp_dir/$archive"
  printf '%s  %s\n' "$sha256" "$tmp_dir/$archive" | sha256sum --check --status

  rm -rf "$install_dir"
  mkdir -p "$install_dir"
  tar -xJf "$tmp_dir/$archive" --strip-components=1 -C "$install_dir"
fi

actual_version="$($zig_bin version)"
if [ "$actual_version" != "$version" ]; then
  echo "Expected Zig $version, got $actual_version" >&2
  exit 1
fi

add_to_path "$install_dir"
echo "Using Zig $actual_version from $zig_bin"
