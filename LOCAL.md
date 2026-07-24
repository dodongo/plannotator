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
