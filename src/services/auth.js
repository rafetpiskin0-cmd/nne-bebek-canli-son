import {
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase.js";

/* ============================================================
   KİMLİK DOĞRULAMA STRATEJİSİ
   ------------------------------------------------------------
   1) Uygulama açılır açılmaz anonim bir Firebase hesabı oluşturulur
      (signInAnonymously). Böylece kullanıcı henüz "gerçek" bir hesap
      açmadan önce bile verileri (window.storage yerine) Firestore'da
      kendi uid'sine kalıcı olarak kaydedilebilir.
   2) Kullanıcı Auth ekranında Google ile giriş yaparsa veya e-posta/
      şifre ile kayıt olursa, mevcut anonim hesap o kimlikle
      "link" edilir (linkWithPopup / linkWithCredential) — böylece
      onboarding sırasında biriken veriler KAYBOLMAZ, aynı uid'ye
      bağlı kalır.
   3) Apple ile giriş, bir Apple Developer hesabı + Sign in with Apple
      servis kimliği gerektirdiği için burada aktif değildir; OAuthProvider
      ('apple.com') iskeleti bırakılmıştır, kendi Apple Developer
      kurulumunuzu yaptıktan sonra kolayca etkinleştirebilirsiniz.
   ============================================================ */

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      signInAnonymously(auth).catch((e) => console.error("Anonim giriş başarısız:", e));
      return;
    }
    callback(user);
  });
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    if (auth.currentUser && auth.currentUser.isAnonymous) {
      const result = await linkWithPopup(auth.currentUser, provider);
      return result.user;
    }
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (e) {
    // Hesap başka bir yöntemle zaten varsa, doğrudan giriş yapmayı dene
    if (e.code === "auth/credential-already-in-use" || e.code === "auth/email-already-in-use") {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
    throw e;
  }
}

export async function registerWithEmail(name, email, password) {
  const cred = EmailAuthProvider.credential(email, password);
  let user;
  if (auth.currentUser && auth.currentUser.isAnonymous) {
    const result = await linkWithCredential(auth.currentUser, cred);
    user = result.user;
  } else {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    user = result.user;
  }
  if (name) await updateProfile(user, { displayName: name });
  return user;
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function signOutUser() {
  await signOut(auth);
  // signOut sonrası oturum tamamen boşalır; watchAuthState bunu yakalayıp
  // otomatik olarak yeni bir anonim oturum açacak ve uygulama Onboarding/
  // Auth ekranına dönecektir (App.jsx'teki watchAuthState mantığı sayesinde).
}

export async function signInWithApple() {
  throw new Error(
    "Apple ile giriş için Apple Developer hesabınızda 'Sign in with Apple' servis kimliği ve Firebase Console > Authentication > Apple sağlayıcısını yapılandırmanız gerekir. Kurulumdan sonra OAuthProvider('apple.com') ile burayı etkinleştirebilirsiniz."
  );
}
