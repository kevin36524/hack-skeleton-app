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

  const keyPath = resolve(process.cwd(), "twiliotest-admin-key.json");
  if (existsSync(keyPath)) {
    const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
    console.log(
      `[rsvp/firebase-admin] initializing app "${APP_NAME}" via key file project=${serviceAccount.project_id} client=${serviceAccount.client_email}`
    );
    return initializeApp({ credential: cert(serviceAccount) }, APP_NAME);
  }

  // Cloud Run (unlike App Engine/Cloud Functions) does NOT auto-set
  // GOOGLE_CLOUD_PROJECT, and applicationDefault() doesn't carry a project_id
  // the way a service-account key file does. Pass it through from env so ADC
  // works when the key file isn't present (e.g. the standalone Docker image).
  const projectId =
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    process.env.FIREBASE_PROJECT_ID;
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
    return {
      ok: false,
      response: NextResponse.json({ error: "Sign in required" }, { status: 401 }),
    };
  }
  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const email = decoded.email?.trim().toLowerCase() ?? null;
    if (!email || !adminEmails().includes(email)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        ),
      };
    }
    return { ok: true, email };
  } catch (err) {
    console.error("[rsvp/firebase-admin] ID token verification failed:", err);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      ),
    };
  }
}
