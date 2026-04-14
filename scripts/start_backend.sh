#!/usr/bin/env sh
set -euo pipefail
cd "$(dirname "$0")/.."
cd backend
exec java -jar target/backend-0.0.1-SNAPSHOT.jar
