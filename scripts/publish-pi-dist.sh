#!/usr/bin/env bash
# Publish the built Pi extension to the dg/pi-dist branch, which Pi installs from git.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
cd "$root"

branch="$(git branch --show-current)"
if [[ "$branch" != "dg/custom" ]]; then
	echo "Expected branch dg/custom, found '$branch'." >&2
	exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
	echo "Working tree must be clean before publishing." >&2
	exit 1
fi

bun install --frozen-lockfile
bun run build:pi

version="$(node -p "require('./apps/pi-extension/package.json').version")"
source_sha="$(git rev-parse --short HEAD)"

staging="$(mktemp -d)"
worktree="$(mktemp -d)/pi-dist"
cleanup() {
	git worktree remove --force "$worktree" 2>/dev/null || true
	rm -rf "$staging" "$(dirname "$worktree")"
}
trap cleanup EXIT

# npm pack honours the files list in apps/pi-extension/package.json, so the
# published tree needs no second copy of that list.
tarball="$(cd apps/pi-extension && npm pack --ignore-scripts --pack-destination "$staging" | tail -1)"
tar -xzf "$staging/$tarball" -C "$staging"

git fetch --quiet origin 'refs/heads/dg/pi-dist:refs/remotes/origin/dg/pi-dist' 2>/dev/null || true
if git rev-parse --verify --quiet refs/remotes/origin/dg/pi-dist >/dev/null; then
	git worktree add --quiet --detach "$worktree" refs/remotes/origin/dg/pi-dist
	git -C "$worktree" switch --quiet --create dg/pi-dist --track refs/remotes/origin/dg/pi-dist 2>/dev/null ||
		git -C "$worktree" switch --quiet dg/pi-dist
else
	git worktree add --quiet --detach "$worktree" HEAD
	git -C "$worktree" switch --quiet --orphan dg/pi-dist
fi

find "$worktree" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$staging/package/." "$worktree/"
git -C "$worktree" add --all

if git -C "$worktree" diff --cached --quiet; then
	echo "dg/pi-dist already matches the current build; nothing to publish."
	exit 0
fi

revision=1
while git rev-parse --verify --quiet "refs/tags/pi-v$version-dg.$revision" >/dev/null; do
	revision=$((revision + 1))
done
tag="pi-v$version-dg.$revision"

git -C "$worktree" commit --quiet -m "Build Pi extension $version from dg/custom $source_sha"
git tag "$tag" "$(git -C "$worktree" rev-parse HEAD)"
git push --quiet origin dg/pi-dist "$tag"

echo "Published $tag from dg/custom $source_sha."
echo "Point settings.base.json at git:git@github.com:dodongo/plannotator@$tag, then run pi-update and /reload in Pi."
