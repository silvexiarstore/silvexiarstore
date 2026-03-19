import { getApp, getApps, initializeApp } from "firebase/app";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

function ensureFirebaseConfig() {
  const required: Array<[string, string]> = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", firebaseConfig.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", firebaseConfig.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", firebaseConfig.projectId],
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", firebaseConfig.storageBucket],
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", firebaseConfig.messagingSenderId],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", firebaseConfig.appId],
  ];

  const missing = required
    .filter(([, value]) => !value.trim())
    .map(([name]) => name);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase env vars: ${missing.join(", ")}`);
  }
}

function getFirebaseStorageClient() {
  ensureFirebaseConfig();
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return getStorage(app);
}

export async function uploadFileToFirebase(file: File, filePath: string): Promise<string> {
  const storage = getFirebaseStorageClient();
  const storageRef = ref(storage, filePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type || undefined,
  });

  return getDownloadURL(storageRef);
}
