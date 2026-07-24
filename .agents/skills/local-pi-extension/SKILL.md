---
name: local-pi-extension
description: Maintains the local Plannotator Pi extension fork on dg/custom, including custom changes, stable-release rebases, builds, local Pi installation, checks, and reloads. Use whenever changing or updating the Pi extension in this checkout.
---

# Local Plannotator Pi Extension

Maintain this checkout as a local-only fork. Never push dg/custom or open a
pull request unless the user changes this policy.

## Fixed setup

1. Work in the repository root returned by:

       git rev-parse --show-toplevel

2. Require the branch to be dg/custom.
3. Treat origin as a fetch-only upstream for backnotprop/plannotator.
4. Base custom work on stable release tags, not origin/main.
5. Pi must load the local package at:

       ~/Projects/external/plannotator/apps/pi-extension

## Make custom changes

1. Read AGENTS.md and all files that own the behavior before editing.
2. Confirm a clean starting state and inspect recent custom commits:

       git status --short --branch
       git log --oneline --decorate -10

3. Limit edits to the custom function, its focused tests, and agent-facing
   local files such as this skill. Avoid upstream-facing churn:
   1. Do not update README files, changelogs, release notes, screenshots,
      package descriptions, or versions unless the user asks or the function
      cannot work without the change.
   2. Do not copy local-only usage notes into public project docs. Put notes an
      agent needs in this skill instead.
   3. Keep generated build files out of git.
4. Run focused tests, then the checks required by the changed area.
5. Build the Pi extension from the repository root:

       bun install --frozen-lockfile
       bun run build:pi

6. Confirm Pi still loads the local package:

       pi list
       PI_OFFLINE=1 pi --no-extensions -e "$PWD/apps/pi-extension" --list-models >/dev/null

7. Commit the finished custom change on dg/custom. Never push it.
8. Tell the user to run /reload in Pi.

## Current custom behavior

Start one persistent Pi code review session with an optional local Git
comparison base:

    /review-start
    /review-start --base origin/release/2026.08

Without --base, review keeps the detected origin/HEAD default. Do not use
--base with a pull request URL or --no-local.

Sending feedback keeps the browser review open for more feedback. Stop the
session from Pi with:

    /review-stop

Submitted comments remain pending in the browser. The common plannotator skill
owns the agent-side comment workflow; keep its script contract and the
extension's PLANNOTATOR_REVIEW_URL session environment variable in sync.

## Take the latest stable extension

Start with a clean, committed dg/custom branch, then run:

    scripts/rebase-pi-extension-stable.sh

The script reads the npm latest tag for @plannotator/pi-extension, fetches
upstream tags, rebases dg/custom onto the matching release tag, installs the
locked dependencies, and rebuilds the Pi extension.

If the rebase conflicts:

1. Read both sides and preserve the local behavior intentionally.
2. Resolve each file and stage it.
3. Continue with git rebase --continue.
4. Repeat until complete. Do not abort unless the user asks.
5. Run:

       bun install --frozen-lockfile
       bun run build:pi

6. Run focused tests and verify pi list.
7. Do not push the rebased branch.
8. Tell the user to run /reload.

## Install or repair the local Pi package

Normal source and server changes need only a rebuild and /reload. Reinstall
only when Pi settings no longer point at this checkout.

From the repository root:

    pi remove npm:@plannotator/pi-extension || true
    pi install "$PWD/apps/pi-extension"
    pi list

Fail if both the npm package and local path remain listed. The local path must
be the sole Plannotator Pi package in ~/.pi/agent/settings.json.

## Safety rules

1. Never rebase with uncommitted work.
2. Never update from main when the goal is a stable extension update.
3. Never use reset, clean, checkout, or restore to discard work.
4. Never commit node_modules, dist output, or generated Pi HTML/vendor files
   ignored by the repository.
5. Never install the npm Plannotator extension beside the local package.
6. Never push dg/custom.
