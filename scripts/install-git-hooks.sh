#!/bin/sh
set -eu

profile="${1:-public}"

case "$profile" in
  public|private) ;;
  *)
    echo "Uso: sh scripts/install-git-hooks.sh [public|private]" >&2
    exit 1
    ;;
esac

git config core.hooksPath ".githooks/$profile"

echo "Hooks Git configurados para o perfil '$profile'."
echo "core.hooksPath = .githooks/$profile"
