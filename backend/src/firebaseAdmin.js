import admin from "firebase-admin";

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn(
      "[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not set. " +
        "Auth verification will fail until this is configured."
    );
    return;
  }

  const serviceAccount = JSON.parse(raw);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
}

/**
 * Express middleware: verifies the Firebase ID token sent as
 * "Authorization: Bearer <token>" and attaches the decoded user to req.user.
 * Rejects the request with 401 if the token is missing or invalid.
 */
export async function requireAuth(req, res, next) {
  try {
    initFirebaseAdmin();

    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Missing or malformed Authorization header" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // { uid, email, name, ... }
    next();
  } catch (err) {
    console.error("[requireAuth] Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
