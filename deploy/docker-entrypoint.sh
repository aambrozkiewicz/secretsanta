#!/bin/sh
set -eu

# Stop on a failed migration; never start against an incompatible schema.
npm run db:deploy
exec node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port "${PORT:-3000}"
