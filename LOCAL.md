# Local Pi extension workflow

Pi loads this checkout from apps/pi-extension instead of the npm package.

## Rebuild

    bun run build:pi

Run /reload in Pi after rebuilding.

## Update from the latest stable release

    scripts/rebase-pi-extension-stable.sh

The script rebases dg/custom onto the tag published as the npm package's
latest version, installs the locked dependencies, and rebuilds the Pi
extension. Resolve any rebase conflict, rerun the build, then run /reload in
Pi.
# Local Pi extension workflow

Pi installs the extension from git, not from this checkout and not from npm. The
`dg/pi-dist` branch of `origin` holds the built package at its root, and
`~/.dotfiles/.pi/agent/settings.base.json` pins a tag on that branch.

## Publish a change

    scripts/publish-pi-dist.sh

From a clean `dg/custom`, the script builds the extension, packs it with the
`files` list in `apps/pi-extension/package.json`, replaces the `dg/pi-dist`
tree with the result, and pushes a new `pi-v<version>-dg.<n>` tag. It then
prints the spec to put in `settings.base.json`. Update that file, run
`pi-update`, and run `/reload` in Pi.

## Build without publishing

    bun run build:pi

Useful while iterating, but Pi keeps running the published tag until you
publish and bump the pinned ref.

## Update from the latest stable release

    scripts/rebase-pi-extension-stable.sh

The script rebases dg/custom onto the tag published as the npm package's
latest version, installs the locked dependencies, and rebuilds the Pi
extension. Resolve any rebase conflict, then publish.

## Never open a pull request against upstream

This fork is not meant to merge into `backnotprop/plannotator`.
