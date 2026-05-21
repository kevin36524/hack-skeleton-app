import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const APP_NAME = 'life-graph-admin';

function getOrCreateApp() {
  const existing = getApps().find((a) => a.name === APP_NAME);
  if (existing) return existing;

  const keyPath = resolve(process.cwd(), 'twiliotest-admin-key.json');
  if (existsSync(keyPath)) {
    const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf-8'));
    console.log(`[firestore-client] initializing app "${APP_NAME}" via key file project=${serviceAccount.project_id} client=${serviceAccount.client_email}`);
    return initializeApp({ credential: cert(serviceAccount) }, APP_NAME);
  }

  console.log(`[firestore-client] initializing app "${APP_NAME}" via application default credentials`);
  return initializeApp({ credential: applicationDefault() }, APP_NAME);
}

let _db: Firestore | null = null;
function getDb(): Firestore {
  if (_db) return _db;
  const firestore = getFirestore(getOrCreateApp(), 'life-graph-native');
  try {
    firestore.settings({ ignoreUndefinedProperties: true });
    console.log('[firestore-client] settings applied: ignoreUndefinedProperties=true');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already been (started|initialized)/i.test(msg)) {
      console.warn(`[firestore-client] settings() failed: ${msg}`);
    }
  }
  _db = firestore;
  return firestore;
}

export const db = new Proxy({} as Firestore, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});
