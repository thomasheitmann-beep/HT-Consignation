// Même projet Firebase que les autres apps HT Maintenance
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDA5cCPZO2Wjfx-8YP4WFJQIUVIc-Qqb0",
  authDomain: "ht-maintenance.firebaseapp.com",
  projectId: "ht-maintenance",
  storageBucket: "ht-maintenance.firebasestorage.app",
  messagingSenderId: "273138950416",
  appId: "1:273138950416:web:eb32be0db419dbbfe8c595",
};

const app = initializeApp(firebaseConfig);

// Long-polling forcé : compatibilité Safari (Big Sur / iPad)
export const db = initializeFirestore(app, { experimentalForceLongPolling: true, useFetchStreams: false });

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const logout = () => signOut(auth);
