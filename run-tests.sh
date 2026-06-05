#!/bin/bash
set +e
cd /home/carlos/Proyectos/siste\ contador-libro\ mayor/aequivault/backend
echo "===== Maven version ====="
./mvnw -version 2>&1 | head -5
echo ""
echo "===== Running demo unit tests ====="
./mvnw -B -ntp test -Dtest='DemoRateLimiterTest,DemoClientIpResolverTest' 2>&1 | tail -80
echo ""
echo "===== Test exit code: $? ====="
