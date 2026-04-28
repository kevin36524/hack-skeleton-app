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

export const db = getFirestore(getOrCreateApp(), 'life-graph-native');
