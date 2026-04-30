import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const APP_NAME = 'life-graph-admin';

function getOrCreateApp() {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;

  // Load key from disk explicitly — never rely on GOOGLE_APPLICATION_CREDENTIALS
  const keyPath = resolve(process.cwd(), 'twiliotest-admin-key.json');
  const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
  console.log(`[firestore-client] initializing app "${APP_NAME}" project=${serviceAccount.project_id} client=${serviceAccount.client_email}`);

  return initializeApp({ credential: cert(serviceAccount) }, APP_NAME);
}

const firestore = getFirestore(getOrCreateApp(), 'life-graph-native');

// Entities frequently carry optional fields that are left `undefined` when not
// applicable (event.location, event.endTime, isRecurring, etc.). Without this
// setting the admin SDK throws on `undefined`, which silently dropped event
// writes inside Stage B. Skip undefined props instead of erroring.
//
// `.settings()` throws if Firestore has already been used — possible under
// Next.js dev hot-reload, which re-runs this module while the underlying
// firebase-admin app instance is cached across reloads. Swallow that case.
try {
  firestore.settings({ ignoreUndefinedProperties: true });
  console.log('[firestore-client] settings applied: ignoreUndefinedProperties=true');
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  if (!/already been (started|initialized)/i.test(msg)) {
    console.warn(`[firestore-client] settings() failed: ${msg}`);
  }
}

export const db = firestore;
