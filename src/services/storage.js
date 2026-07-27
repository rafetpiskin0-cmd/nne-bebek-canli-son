import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "./firebase.js";
import { watchAuthState } from "./auth.js";

/* ============================================================
   window.storage POLYFILL — Firestore ile
   ------------------------------------------------------------
   App.jsx (orijinal Claude Artifact kodu) kalıcı depolama için
   SADECE şu iki fonksiyonu kullanıyor:
     await window.storage.get(key, shared)   -> {key, value, shared} | null
     await window.storage.set(key, value, shared) -> {key, value, shared} | null
   Bu dosya, App.jsx'te TEK BİR SATIR DEĞİŞTİRMEDEN aynı arayüzü
   Firestore üzerinden sağlar:
     - shared=false  -> users/{uid}/data/{key}   (kullanıcıya özel)
     - shared=true   -> shared/{key}             (herkese açık/paylaşımlı)
   "value" alanı App.jsx tarafında zaten JSON.stringify edilmiş bir
   metin olarak gönderilir; biz burada olduğu gibi saklarız.
   ============================================================ */

let currentUid = null;
let authReadyResolve;
const authReady = new Promise((resolve) => { authReadyResolve = resolve; });

watchAuthState((user) => {
  currentUid = user.uid;
  authReadyResolve(user.uid);
});

async function getUid() {
  if (currentUid) return currentUid;
  return authReady;
}

function docRef(key, shared) {
  if (shared) return doc(db, "shared", key);
  return doc(db, "users", currentUid, "data", key);
}

async function storagePolyfillGet(key, shared = false) {
  await getUid();
  const ref = docRef(key, shared);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return { key, value: data.value, shared };
}

async function storagePolyfillSet(key, value, shared = false) {
  await getUid();
  const ref = docRef(key, shared);
  await setDoc(ref, { value, updatedAt: Date.now() });
  return { key, value, shared };
}

async function storagePolyfillDelete(key, shared = false) {
  await getUid();
  const ref = docRef(key, shared);
  await deleteDoc(ref);
  return { key, deleted: true, shared };
}

async function storagePolyfillList(prefix = "", shared = false) {
  await getUid();
  const colRef = shared ? collection(db, "shared") : collection(db, "users", currentUid, "data");
  const snap = await getDocs(colRef);
  const keys = snap.docs.map((d) => d.id).filter((k) => k.startsWith(prefix));
  return { keys, prefix, shared };
}

export function installStoragePolyfill() {
  if (typeof window === "undefined") return;
  window.storage = {
    get: storagePolyfillGet,
    set: storagePolyfillSet,
    delete: storagePolyfillDelete,
    list: storagePolyfillList,
  };
}

export { getUid };
