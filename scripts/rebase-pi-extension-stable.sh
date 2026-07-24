#!/usr/bin/env bash
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

branch="$(git branch --show-current)"
if [[ "$branch" != "dg/custom" ]]; then
	echo "Expected branch dg/custom, found '$branch'." >&2
	exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
	echo "Working tree must be clean before rebasing." >&2
	exit 1
fi

version="$(npm view @plannotator/pi-extension dist-tags.latest)"
tag="v$version"

git fetch origin --tags
git rev-parse --verify "$tag^{commit}" >/dev/null
git rebase "$tag"
bun install --frozen-lockfile
bun run build:pi

echo "Rebased dg/custom onto $tag and rebuilt the Pi extension. Run /reload in Pi."
