#!/usr/bin/env sh
set -euo pipefail
cd "$(dirname "$0")/.."
cd backend
mvn -DskipTests clean package
