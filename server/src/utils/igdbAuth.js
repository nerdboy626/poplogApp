import fetch from "node-fetch";
import { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET } from "../config/env.js";

let cachedToken = null;
let tokenExpiration = 0;

export async function getIGDBToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiration) {
    return cachedToken;
  }

  console.log("Fetching new IGDB token ... ");
  const url = `https://id.twitch.tv/oauth2/token?client_id=${IGDB_CLIENT_ID}&client_secret=${IGDB_CLIENT_SECRET}&grant_type=client_credentials`;
  const response = await fetch(url, { method: "POST" });
  const data = await response.json();

  cachedToken = data.access_token;
  tokenExpiration = now + data.expires_in * 1000;

  return cachedToken;
}
