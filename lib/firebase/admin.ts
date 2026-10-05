import { initializeApp, getApps, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";
import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// Server-side Firestore access for the RSVP app. Mirrors
// hack-messenger's src/lib/messenger/firestore-client.ts: a dedicated
// named admin app pointed at the twiliotest-8d802 project, using the
// rsvp-navaratri database (separate from the messenger/life-graph DBs).
const APP_NAME = "rsvp-admin";

/** Database ID from env, defaulting to the dedicated RSVP database. */
export function rsvpDatabaseId(): string {
  const envId = process.env.RSVP_FIRESTORE_DATABASE;
  return envId?.trim() || "rsvp-navaratri";
}

function getOrCreateApp() {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;

  const keyPath = resolve(process.cwd(), "hriyaan-24ae1-hproxy.json");
  if (existsSync(keyPath)) {
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
    console.log(
      `[rsvp/firebase-admin] initializing app "${APP_NAME}" via key file project=${serviceAccount.project_id} client=${serviceAccount.client_email}`
    );
    return initializeApp({ credential: cert(serviceAccount) }, APP_NAME);
  }

  // Cloud Run (unlike App Engine/Cloud Functions) does NOT auto-set
  // GOOGLE_CLOUD_PROJECT, and applicationDefault() doesn't carry a project_id
  // the way a service-account key file does. Without an explicit projectId the
  // Firestore client throws "Client is not yet ready to issue requests." Pass
  // it through from env, falling back to the project this app is deployed in.
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT_ID ||
    "hriyaan-24ae1";
  console.log(
    `[rsvp/firebase-admin] initializing app "${APP_NAME}" via application default credentials project=${projectId ?? "(unset)"}`
  );
  return initializeApp({ credential: applicationDefault(), projectId }, APP_NAME);
}

let _db: Firestore | null = null;
function getDb(): Firestore {
  if (_db) return _db;
  const firestore = getFirestore(getOrCreateApp(), rsvpDatabaseId());
  try {
    firestore.settings({ ignoreUndefinedProperties: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already been (started|initialized)/i.test(msg)) {
      console.warn(`[rsvp/firebase-admin] settings() failed: ${msg}`);
    }
  }
  _db = firestore;
  return firestore;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

// ── Auth & admin guard ──────────────────────────────────────────────────────

let _auth: Auth | null = null;
export function getAdminAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getOrCreateApp());
  }
  return _auth;
}

/** Comma-separated list of emails allowed to use the admin dashboard. */
export function adminEmails(): string[] {
  return (process.env.NEXT_PUBLIC_RSVP_ADMIN_EMAILS || "kevin36524@gmail.com")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminCheck =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse };

/** Verifies the request's Firebase ID token and checks it belongs to an admin. */
export async function requireAdmin(request: NextRequest): Promise<AdminCheck> {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : null;
  if (!token) {
    console.log("[rsvp/admin] 401: request had no Bearer token");
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }

  const segments = token.split(".").length;
  if (segments !== 3) {
    // A Firebase ID token is a three-segment JWT. Anything else (e.g. a
    // Google access token sent by a stale pre-refresh browser tab) can never
    // verify — reject with a clear message instead of a decoding error.
    console.log(
      `[rsvp/admin] 401: token is not a JWT (segments=${segments}, prefix=${token.slice(0, 12)}...)`
    );
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Unrecognized token — please refresh the page and sign in again" },
        { status: 401 }
      ),
    };
  }

  // Decode claims WITHOUT verifying, for diagnostics only.
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    ) as { aud?: string; iss?: string; email?: string; exp?: number };
    console.log(
      `[rsvp/admin] verify attempt: aud=${payload.aud} iss=${payload.iss} email=${payload.email} exp=${payload.exp} now=${Math.floor(Date.now() / 1000)}`
    );
  } catch {
    console.log("[rsvp/admin] could not decode token payload for diagnostics");
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const email = decoded.email?.trim().toLowerCase() ?? null;
    if (!email || !adminEmails().includes(email)) {
      console.log(
        `[rsvp/admin] 403: verified email "${email}" is not in admin list [${adminEmails().join(", ")}]`
      );
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        ),
      };
    }
    console.log(`[rsvp/admin] OK: admin ${email}`);
    return { ok: true, email };
  } catch (err) {
    console.error(
      `[rsvp/admin] verifyIdToken failed for prefix ${token.slice(0, 12)}...:`,
      (err as { code?: string })?.code ?? err
    );
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      ),
    };
  }
}
