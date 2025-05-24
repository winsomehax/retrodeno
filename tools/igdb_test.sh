#!/bin/bash
# igdb_test.sh - Get IGDB access token and query for 'zelda' using .env variables

set -e

# Load .env variables
export $(grep -v '^#' .env | grep -E 'TWITCH_CLIENT_ID|TWITCH_SECRET' | xargs)

if [ -z "$TWITCH_CLIENT_ID" ] || [ -z "$TWITCH_SECRET" ]; then
  echo "Missing TWITCH_CLIENT_ID or TWITCH_SECRET in .env"
  exit 1
fi

echo "Getting IGDB access token..."
TOKEN=$(curl -s -X POST 'https://id.twitch.tv/oauth2/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d "client_id=$TWITCH_CLIENT_ID&client_secret=$TWITCH_SECRET&grant_type=client_credentials" | jq -r .access_token)

echo $TOKEN
if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "Querying IGDB for 'Alter Ego - Female Version'..."
curl -X POST 'https://api.igdb.com/v4/games' \
  -H "Client-ID: $TWITCH_CLIENT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Accept: application/json' \
  -H 'Content-Type: text/plain' \
  -d 'search "zelda"; fields id,name,rating,cover.url,screenshots.url,videos.video_id,summary; limit 5;'
