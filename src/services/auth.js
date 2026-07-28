/* ============================================================
   services/auth.js — Firebase Authentication entegrasyonu
   ============================================================
   Bu dosya App.jsx tarafından kullanılan şu fonksiyonları sağlar:
     signInWithGoogle, signInWithApple, registerWithEmail,
     signInWithEmail, resetPassword, watchAuthState

   KURULUM (bunları SEN yapmalısın, kodla yapılamaz):
   1) npm paketi kur:
        npm install firebase

   2) https://console.firebase.google.com adresinde bir proje oluştur
      (veya var olanı kullan) ve bir "Web App" ekle. Sana verilen
      firebaseConfig değerlerini aşağıdaki .env dosyasına yaz.

   3) Google ile girişi AÇMAK için:
        Firebase Console → Authentication → Sign-in method →
        "Google" sağlayıcısını seçip "Enable" yap, destek e-postanı
        seç ve kaydet. Bu adım atlanırsa signInWithGoogle çağrısı
        "auth/operation-not-allowed" hatası verir.

      Apple ile giriş istiyorsan aynı ekrandan "Apple" sağlayıcısını
      da etkinleştirmen ve Apple Developer hesabından Service ID/
      Key bilgilerini girmen gerekir (bu adım opsiyoneldir).

   4) Projenin kök dizininde bir ".env" dosyası oluştur (Vite projesi
      varsayılıyor, CRA kullanıyorsan REACT_APP_ önekine çevir):

        VITE_FIREBASE_API_KEY=...
        VITE_FIREBASE_AUTH_DOMAIN=...
        VITE_FIREBASE_PROJECT_ID=...
        VITE_FIREBASE_STORAGE_BUCKET=...
        VITE_FIREBASE_MESSAGING_SENDER_ID=...
        VITE_FIREBASE_APP_ID=...

      Bu değerleri Firebase Console → Project settings → General →
      "Your apps" altındaki Web App kaydından kopyalayabilirsin.

   5) Yerel geliştirmede test ediyorsan "localhost" zaten varsayılan
      olarak yetkili domain listesindedir. Uygulamayı canlıya
      aldığında gerçek domainini de Firebase Console →
      Authentication → Settings → Authorized domains kısmına eklemen
      gerekir, aksi halde Google popup'ı "unauthorized-domain"
      hatası verir.
   ============================================================ */

import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  linkWithPopup,
  linkWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
// Google hesap seçim ekranını her seferinde göster (tek hesapta takılı kalmasın)
googleProvider.setCustomParameters({ prompt: "select_account" });

const appleProvider = new OAuthProvider("apple.com");

/* Kullanıcı dostu Türkçe hata mesajları */
function toFriendlyError(e) {
  const code = e && e.code ? e.code : "";
  const map = {
    "auth/operation-not-allowed": "Bu giriş yöntemi Firebase konsolunda henüz etkinleştirilmemiş.",
    "auth/unauthorized-domain": "Bu domain Firebase'de yetkili domainler listesinde değil.",
    "auth/popup-closed-by-user": "Giriş penceresi kapatıldı, tekrar deneyebilirsiniz.",
    "auth/popup-blocked": "Tarayıcınız açılır pencereyi engelledi, izin verip tekrar deneyin.",
    "auth/email-already-in-use": "Bu e-posta adresi zaten kayıtlı, giriş yapmayı deneyin.",
    "auth/invalid-email": "Geçerli bir e-posta adresi girin.",
    "auth/weak-password": "Şifre en az 6 karakter olmalı.",
    "auth/wrong-password": "E-posta veya şifre hatalı.",
    "auth/user-not-found": "Bu e-postayla kayıtlı bir hesap bulunamadı.",
    "auth/invalid-credential": "E-posta veya şifre hatalı.",
    "auth/credential-already-in-use": "Bu hesap zaten başka bir kullanıcıya bağlı.",
    "auth/network-request-failed": "İnternet bağlantınızı kontrol edip tekrar deneyin.",
  };
  const message = map[code] || (e && e.message) || "Bir hata oluştu, tekrar deneyin.";
  const err = new Error(message);
  err.code = code;
  throw err;
}

/* Mevcut kullanıcı anonimse hesabı KORUYARAK (uygulama içi verileri
   kaybetmeden) kalıcı bir hesaba yükseltir; anonim değilse normal
   popup girişi yapar. */
async function popupSignIn(provider) {
  const current = auth.currentUser;
  try {
    if (current && current.isAnonymous) {
      return await linkWithPopup(current, provider);
    }
    return await signInWithPopup(auth, provider);
  } catch (e) {
    // Anonim hesap zaten bu sağlayıcıyla eşleşen bir hesaba bağlıysa
    // (credential-already-in-use), o mevcut hesaba normal girişle devam et.
    if (e.code === "auth/credential-already-in-use" && e.credential) {
      return await signInWithPopup(auth, provider);
    }
    return toFriendlyError(e);
  }
}

export async function signInWithGoogle() {
  return popupSignIn(googleProvider);
}

export async function signInWithApple() {
  return popupSignIn(appleProvider);
}

export async function registerWithEmail(name, email, password) {
  const current = auth.currentUser;
  try {
    let cred;
    if (current && current.isAnonymous) {
      const emailCred = EmailAuthProvider.credential(email, password);
      cred = await linkWithCredential(current, emailCred);
    } else {
      cred = await createUserWithEmailAndPassword(auth, email, password);
    }
    if (name && name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    return cred;
  } catch (e) {
    return toFriendlyError(e);
  }
}

export async function signInWithEmail(email, password) {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (e) {
    return toFriendlyError(e);
  }
}

export async function resetPassword(email) {
  try {
    return await sendPasswordResetEmail(auth, email);
  } catch (e) {
    return toFriendlyError(e);
  }
}

/* Oturum durumunu dinler. Hiç oturum yoksa otomatik olarak anonim
   oturum açar (App.jsx bu durumda onboarding akışını gösterir),
   var olan bir oturumda ise doğrudan callback'i çağırır. */
export function watchAuthState(callback) {
  let signingInAnon = false;
  const unsub = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      if (signingInAnon) return;
      signingInAnon = true;
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Anonim giriş başarısız:", e);
        signingInAnon = false;
      }
      return; // onAuthStateChanged tekrar tetiklenecek, callback o zaman çağrılır
    }
    signingInAnon = false;
    callback(user);
  });
  return unsub;
}

export { auth };
