#!/usr/bin/env bash
set -euo pipefail

# Script para importar validadores.sql a la base de datos Railway
# Uso:
#   ./scripts/import_validadores_railway.sh

readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly SQL_FILE="${ROOT_DIR}/validadores.sql"
readonly MYSQL_HOST="trolley.proxy.rlwy.net"
readonly MYSQL_PORT="22764"
readonly MYSQL_USER="root"
readonly MYSQL_DB="railway"
readonly MYSQL_PWD="HGMFzyaCRfCcSAZPxRHlmoBvHidAKGAu"

if [[ ! -f "${SQL_FILE}" ]]; then
  echo "Error: no se encontró el archivo SQL en ${SQL_FILE}"
  exit 1
fi

echo "Importando ${SQL_FILE} a ${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DB}..."

env MYSQL_PWD="${MYSQL_PWD}" mysql --protocol=TCP \
  -h "${MYSQL_HOST}" \
  -P "${MYSQL_PORT}" \
  -u "${MYSQL_USER}" "${MYSQL_DB}" < "${SQL_FILE}"

echo "Importación completada."
