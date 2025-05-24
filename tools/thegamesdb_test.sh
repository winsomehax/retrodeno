#!/bin/bash
# igdb_test.sh - Get IGDB access token and query for 'zelda' using .env variables

set -e

# Load .env variables
export $(grep -v '^#' ../.env | grep -E 'THEGAMESDB_API_KEY' | xargs)

if [ -z "$THEGAMESDB_API_KEY" ] || [ -z "$THEGAMESDB_API_KEY" ]; then
  echo "Missing THEGAMESDB_API_KEY in .env"
  exit 1
fi

curl -X GET "https://api.thegamesdb.net/v1/Games/ByGameName?apikey=$THEGAMESDB_API_KEY&name=search&fields=*" -H "accept: application/json"

exit
