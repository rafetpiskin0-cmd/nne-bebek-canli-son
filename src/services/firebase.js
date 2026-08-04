/* ============================================================
   services/firebase.js — Firebase App / Auth / Firestore init
   ------------------------------------------------------------
   auth.js ve App.jsx bu dosyadan `auth` (Firebase Authentication)
   ve `db` (Firestore) örneklerini import eder. Bu dosya öncesinde
   eksikti; bu yüzden auth.js hiç çalışamıyordu.

   KURULUM:
   1) https://console.firebase.google.com adresinde bir proje
      oluştur (yoksa).
   2) Project settings > General > "Your apps" bölümünden bir Web
      App ekle; sana verilen config objesini aşağıya YAPIŞTIRMA —
      onun yerine ortam değişkenlerini kullan (bkz. .env.example).
   3) Authentication > Sign-in method: "Anonymous" ve "Google"
      sağlayıcılarını etkinleştir (auth.js ikisini de kullanıyor).
   4) Firestore Database oluştur (production mode) ve
      firestore.rules dosyasındaki kuralları uygula.
   ============================================================ */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Vite kullanıyorsan bu değişkenler otomatik çalışır (proje kökünde
// .env dosyasında VITE_FIREBASE_* olarak tanımlanmalı).
// Create React App / Next.js kullanıyorsan bu satırı ve .env
// değişken adlarını projene göre uyarlaman gerekir (bkz. dosya sonu not).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  // Konsolda net bir uyarı — env değişkenleri eksikse "beyaz ekran"
  // yerine sebebi hemen görünsün diye.
  console.error(
    "[firebase.js] Firebase config eksik! .env dosyanda VITE_FIREBASE_* " +
    "değişkenlerinin tanımlı olduğundan emin ol (bkz. .env.example)."
  );
}

// Hot-reload / çift import durumunda "app already exists" hatasını önler.
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

/* ------------------------------------------------------------
   NOT — Create React App veya Next.js kullanıyorsan:
   - CRA: import.meta.env.VITE_X yerine process.env.REACT_APP_X kullan
     ve .env dosyanda REACT_APP_FIREBASE_API_KEY şeklinde adlandır.
   - Next.js: process.env.NEXT_PUBLIC_FIREBASE_API_KEY kullan.
   Hangisini kullandığını söylersen bu dosyayı ona göre güncelleyebilirim.
   ------------------------------------------------------------ */
