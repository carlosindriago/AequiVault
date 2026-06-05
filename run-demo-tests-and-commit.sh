#!/usr/bin/env bash
set -e

REPO="/home/carlos/Proyectos/siste contador-libro mayor"
BACKEND="$REPO/aequivault/backend"
FRONTEND="$REPO/aequivault/frontend"

echo "=========================================="
echo " 1) Backend demo unit tests (Maven)"
echo "=========================================="
cd "$BACKEND"
./mvnw -B -ntp test \
  -Dtest='DemoRateLimiterTest,DemoClientIpResolverTest'

echo ""
echo "=========================================="
echo " 2) Frontend tests (Karma + ChromeHeadless)"
echo "=========================================="
cd "$FRONTEND"
npm test -- --watch=false --browsers=ChromeHeadless

echo ""
echo "=========================================="
echo " 3) Git stage + commit"
echo "=========================================="
cd "$REPO"
git add -A
git commit -m "feat: finalize ephemeral demo module with frontend auto-login and rate limiting"

echo ""
echo "=========================================="
echo " ✅ Todo OK"
echo "=========================================="
