// igdb.js - IGDB API integration for querying games by tag/title
import * as path from 'https://deno.land/std/path/mod.ts';
// Assuming .env is loaded by the main application (app.js)
// If this module needs to run standalone and load .env, add:
// import "https://deno.land/std/dotenv/load.ts";

const IGDB_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const CLIENT_ID = Deno.env.get('TWITCH_CLIENT_ID');
const CLIENT_SECRET = Deno.env.get('TWITCH_SECRET');

let accessToken = null;
let tokenExpires = 0;

// Helper to get the directory name of the current module
const currentModuleDir = path.dirname(path.fromFileUrl(import.meta.url));
// Ensure the log file exists
const logFilePath = path.join(currentModuleDir, 'nohup.out');
try {
  await Deno.stat(logFilePath);
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    await Deno.writeTextFile(logFilePath, ''); // Create an empty file if it doesn't exist
  } else {
    console.error("Error checking/creating log file:", error);
  }
}

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpires - 60000) {
    return accessToken;
  }
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'client_credentials');

  const resp = await fetch(IGDB_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`Failed to get IGDB token: ${resp.status} - ${errorText}`);
  }

  const tokenData = await resp.json();
  accessToken = tokenData.access_token;
  tokenExpires = Date.now() + (tokenData.expires_in * 1000);
  return accessToken;
}

async function searchGame(tag) {
  const apiUrl = 'https://api.igdb.com/v4/games';
  const token = await getAccessToken();
  const query = `search "${tag}"; fields id,name,rating,cover.url,screenshots.url,videos.video_id,summary; limit 5;`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Client-ID': CLIENT_ID,
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'text/plain' // IGDB API expects the query as plain text in the body
    },
    body: query
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IGDB API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  try {
    return await response.json();
  } catch (e) {
    const responseText = await response.text(); // Re-read text if JSON parsing fails
    throw new Error(`IGDB API JSON parsing error: ${e.message}. Response text: ${responseText}`);
  }
}

// Exporting as a default object to match how it's imported in igdbController.js
export default {
  getAccessToken,
  searchGame
};
