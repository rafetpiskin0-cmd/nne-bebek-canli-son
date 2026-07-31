import {
  signInAnonymously,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  linkWithPopup,
  linkWithRedirect,
  linkWithCredential,
  getRedirectResult,
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
   3) Google girişi önce popup penceresiyle denenir. Tarayıcı popup'ı
      engellerse (auth/popup-blocked) veya bazı mobil tarayıcı/WebView
      ortamlarında popup güvenilir çalışmazsa, otomatik olarak sayfa
      yönlendirmeli (redirect) girişe düşülür. Redirect sonucu sayfa
      yeniden yüklendiğinde handleRedirectResult() ile işlenir — bu
      fonksiyon App.jsx içinde uygulama açılışında bir kez çağrılmalıdır.
   4) Apple ile giriş, bir Apple Developer hesabı + Sign in with Apple
      servis kimliği gerektirdiği için burada aktif değildir; OAuthProvider
      ('apple.com') iskeleti bırakılmıştır, kendi Apple Developer
      kurulumunuzu yaptıktan sonra kolayca etkinleştirebilirsiniz.
   ============================================================ */

// getRedirectResult() birden fazla yerden çağrılabilir (App.jsx açılışta,
// watchAuthState de savunma amaçlı) ama Firebase bunu güvenilir şekilde
// sadece bir kez "gerçek" sonuçla döndürür; bu yüzden tek bir paylaşılan
// Promise'e sarıyoruz ki her çağıran aynı sonucu beklesin ve redirect
// sonucu birden fazla kez tüketilmeye çalışılmasın.
let redirectResultPromise = null;
function resolveRedirectOnce() {
  if (!redirectResultPromise) {
    redirectResultPromise = getRedirectResult(auth).catch((e) => {
      console.error("Redirect girişi tamamlanamadı:", e);
      return null;
    });
  }
  return redirectResultPromise;
}

let initialRedirectChecked = false;

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!initialRedirectChecked) {
      initialRedirectChecked = true;
      // KRİTİK: İlk onAuthStateChanged tetiklenmesi, özellikle daha önce
      // yerelde (IndexedDB) kayıtlı bir anonim kullanıcı varsa, olası bir
      // Google redirect linking'i henüz işlenmeden ESKİ/bayat user
      // nesnesiyle (isAnonymous: true) gelebilir. Bunu doğrudan callback'e
      // iletirsek uygulama "girişi görmedi" gibi davranıp onboarding/auth
      // ekranına döner. Bu yüzden ilk tetiklenmede önce bekleyip
      // auth.currentUser'ın en güncel halini kullanıyoruz.
      await resolveRedirectOnce();
      user = auth.currentUser;
    }
    if (!user) {
      if (!auth.currentUser) {
        signInAnonymously(auth).catch((e) => console.error("Anonim giriş başarısız:", e));
      }
      return;
    }
    callback(user);
  });
}

// Popup engellendiğinde/başarısız olduğunda hangi hatalarda redirect'e
// düşeceğimizi belirler. Kullanıcı bilerek popup'ı kapattıysa
// (popup-closed-by-user) yeniden yönlendirmeye zorlamıyoruz.
function shouldFallbackToRedirect(e) {
  return [
    "auth/popup-blocked",
    "auth/operation-not-supported-in-this-environment",
    "auth/cancelled-popup-request",
    "auth/web-storage-unsupported",
  ].includes(e && e.code);
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const current = auth.currentUser;
  try {
    if (current && current.isAnonymous) {
      const result = await linkWithPopup(current, provider);
      return result.user;
    }
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (e) {
    // Hesap başka bir yöntemle zaten varsa, doğrudan giriş yapmayı dene.
    // ÖNEMLİ: bu ikinci deneme de popup engeline takılabilir (özellikle
    // linkWithPopup'ın hemen ardından art arda açılan ikinci popup bazı
    // tarayıcılarda kullanıcı jestinden kopuk sayılıp engellenebiliyor),
    // bu yüzden bunu da kendi try/catch'i içinde ele alıp gerekirse
    // redirect'e düşürüyoruz. Aksi halde auth/popup-blocked hatası
    // yakalanmadan dışarı fırlar.
    if (e.code === "auth/credential-already-in-use" || e.code === "auth/email-already-in-use") {
      try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
      } catch (e2) {
        if (shouldFallbackToRedirect(e2)) {
          await signInWithRedirect(auth, provider);
          return null; // sayfa yönlendirilecek, buraya dönülmeyecek
        }
        throw e2;
      }
    }
    // Popup engellendi veya bu ortamda desteklenmiyor → sayfa yönlendirmeli
    // girişe düş. Bu çağrı sayfayı Google'a yönlendirir; sonuç, sayfa geri
    // döndüğünde handleRedirectResult() ile alınır (bu fonksiyon burada
    // bir Promise döndürmez, sayfa zaten yeniden yüklenir).
    if (shouldFallbackToRedirect(e)) {
      if (current && current.isAnonymous) {
        await linkWithRedirect(current, provider);
      } else {
        await signInWithRedirect(auth, provider);
      }
      return null; // sayfa yönlendirilecek, buraya dönülmeyecek
    }
    throw e;
  }
}

// Uygulama açılışında bir kez çağrılmalıdır (redirect ile giriş sonrası
// sayfa geri döndüğünde sonucu/varsa hatayı almak için). Redirect
// akışı kullanılmadıysa sessizce null döner, hata fırlatmaz.
export async function handleRedirectResult() {
  const result = await resolveRedirectOnce();
  return result ? result.user : null;
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
