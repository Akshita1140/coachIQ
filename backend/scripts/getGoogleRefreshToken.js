/**
 * One-time setup script — run this ONCE, locally, as the mentor (you).
 * It walks you through Google's OAuth consent screen and prints a refresh
 * token. Paste that token into backend/.env as GOOGLE_REFRESH_TOKEN.
 *
 * After this, the backend can create Calendar events + Meet links on your
 * calendar forever, without you (or any student) logging into Google again —
 * the refresh token doesn't expire unless you manually revoke access.
 *
 * Usage:
 *   1. Fill in GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in backend/.env first
 *      (see backend/.env.example for where to get these).
 *   2. node scripts/getGoogleRefreshToken.js
 *   3. Open the URL it prints, sign in with YOUR Google account, approve.
 *   4. Copy the "code" query param from the redirected URL and paste it
 *      into the terminal prompt.
 *   5. Copy the printed refresh token into backend/.env.
 */
import "dotenv/config";
import { google } from "googleapis";
import readline from "node:readline";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in backend/.env.\n" +
      "Create an OAuth Client ID (Desktop app type is fine for this one-time script) " +
      "in Google Cloud Console → APIs & Services → Credentials, then fill in .env."
  );
  process.exit(1);
}

const redirectUri = GOOGLE_REDIRECT_URI || "http://localhost:5000/oauth2callback";

const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUri);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/calendar"],
});

console.log("\n1. Open this URL, sign in with the mentor Google account, and approve access:\n");
console.log(authUrl);
console.log(
  "\n2. Google will redirect you to a URL like http://localhost:5000/oauth2callback?code=XXXX\n" +
    "   (it's fine if that page fails to load — you just need the 'code' value from the address bar)\n"
);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Paste the code here: ", async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code.trim());
    console.log("\n✅ Success! Add this to backend/.env:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
    if (!tokens.refresh_token) {
      console.log(
        "\n⚠️  No refresh token was returned. This usually happens if you've already granted " +
          "access before. Go to https://myaccount.google.com/permissions, remove access for this " +
          "app, then re-run this script."
      );
    }
  } catch (err) {
    console.error("\n❌ Failed to exchange code for tokens:", err.message);
  } finally {
    rl.close();
  }
});