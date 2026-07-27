import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/* ============================================================
   FIREBASE YAPILANDIRMASI
   Bu değerler .env dosyasından (VITE_FIREBASE_*) okunur.
   NOT: Bu config değerleri "gizli anahtar" değildir — Firebase web
   config'i istemci tarafında görünmesi normal ve beklenen bir
   yapıdır. Gerçek erişim kontrolü Firestore Security Rules ile
   sağlanır (bkz. firestore.rules). Buna karşın GEMINI_API_KEY gibi
   gerçek API anahtarları ASLA VITE_ öneki almamalı / client'a
   gömülmemelidir (bkz. api/gemini.js).
   ============================================================ */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[firebase.js] VITE_FIREBASE_API_KEY bulunamadı. .env dosyanızı .env.example'a göre oluşturduğunuzdan emin olun."
  );
}

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
