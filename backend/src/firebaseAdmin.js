import admin from "firebase-admin";

let initialized = false;

function initFirebaseAdmin() {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.warn(
      "[firebaseAdmin] Missing one or more required env vars " +
        "(FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). " +
        "Auth verification will fail until these are configured."
    );
    return;
  }

  // Convert literal "\n" text (from env var) into real newlines for the PEM key
  const privateKey = privateKeyRaw.replace(/\\n/g, "\n").trim();

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
  console.log("[firebaseAdmin] Initialized successfully for project:", projectId);
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