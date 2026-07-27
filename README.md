# Anne & Bebek — Kurulum ve Canlıya Alma Rehberi

Bu proje: **Vite + React** arayüzü, **Firebase** (Firestore + Authentication) veritabanı/oturum
katmanı, ve gerçek **Gemini 2.5 Flash** çağrılarını güvenle yapan bir **Vercel Serverless Function**
(`api/gemini.js`) içerir.

**Neden bu yapı?** Bir API anahtarı asla tarayıcı koduna gömülmemelidir — herkes "Görünüm Kaynağı"
ile görebilir ve kötüye kullanabilir. Bu yüzden Gemini anahtarınız yalnızca sunucu tarafında
(Vercel'in ortam değişkenlerinde) tutulur; tarayıcı sadece kendi `/api/gemini` uç noktamıza istek
atar, o da anahtarı ekleyip Google'a iletir.

---

## 1) Firebase Kurulumu (10 dakika)

1. https://console.firebase.google.com adresinden **Add project** ile yeni bir proje oluşturun.
2. Sol menüden **Build > Firestore Database > Create database** ile Firestore'u
   **production mode**'da başlatın (bölge olarak size yakın birini seçin, örn. `eur3`).
3. Sol menüden **Build > Authentication > Get started**. **Sign-in method** sekmesinden:
   - **Anonymous** sağlayıcısını **etkinleştirin** (uygulama ilk açılışta bunu kullanır).
   - **Email/Password** sağlayıcısını **etkinleştirin**.
   - **Google** sağlayıcısını **etkinleştirin** (destek e-postası seçmeniz istenecek).
4. Proje ayarlarına gidin (dişli ikonu > **Project settings**) > **Your apps** > **Web** (`</>`)
   simgesiyle bir web uygulaması ekleyin. Size bir `firebaseConfig` nesnesi verecek — bu
   değerleri birazdan `.env` dosyanıza yapıştıracaksınız.
5. Firestore güvenlik kurallarını yükleyin: Firebase Console > Firestore Database > **Rules**
   sekmesine bu depodaki `firestore.rules` dosyasının içeriğini yapıştırıp **Publish** edin.

## 2) Gemini API Anahtarı

Zaten bir anahtarınız olduğunu belirttiniz — https://aistudio.google.com/apikey üzerinden
aldığınız anahtarı bir kenarda tutun, adım 4'te kullanacaksınız. **Bu anahtarı `VITE_` önekiyle
HİÇBİR YERE yazmayın.**

## 3) Yerel Geliştirme

```bash
npm install
cp .env.example .env
# .env dosyasını açıp Firebase config değerlerinizi + GEMINI_API_KEY'i doldurun
```

`/api` fonksiyonlarını yerelde test edebilmek için Vercel CLI kullanın (salt `vite` ile çalıştırırsanız
`/api/gemini` isteği 404 döner, çünkü o rotayı sadece Vercel/`vercel dev` sunar):

```bash
npm i -g vercel
vercel dev
```

Tarayıcıda `http://localhost:3000` (vercel dev'in verdiği port) açılacaktır.

## 4) Vercel'e Deploy (Önerilen — en kolay yol)

1. Bu klasörü bir GitHub reposuna push edin.
2. https://vercel.com adresinde **Add New > Project** ile bu repoyu import edin.
   Vercel, `vercel.json` sayesinde Vite projesini ve `api/gemini.js` fonksiyonunu otomatik tanır.
3. **Environment Variables** ekranında şunları girin:
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
     `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
     (Firebase config'inizden — bunlar client'a gömülecek, bu normal)
   - `GEMINI_API_KEY` (gerçek Gemini anahtarınız — **bu asla `VITE_` önekiyle girilmez**,
     Vercel bunu yalnızca `api/gemini.js` sunucu fonksiyonuna sağlar)
4. **Deploy**'a basın. Birkaç dakika içinde `https://sizin-projeniz.vercel.app` adresinde canlı olur.
5. Firebase Console > Authentication > Settings > **Authorized domains** kısmına Vercel'in size
   verdiği domaini (`sizin-projeniz.vercel.app`) ekleyin — yoksa Google ile giriş çalışmaz.

## 5) Kontrol Listesi (Canlıya Almadan Önce)

- [ ] Firestore Rules `firestore.rules` içeriğiyle **Publish** edildi mi?
- [ ] Authentication'da Anonymous + Email/Password + Google açık mı?
- [ ] Vercel'de `GEMINI_API_KEY` `VITE_` öneki OLMADAN eklendi mi?
- [ ] Vercel domaini Firebase **Authorized domains** listesine eklendi mi?
- [ ] `npm run build` yerelde hatasız tamamlanıyor mu?

## Bilinen Sınırlamalar / Sonraki Adımlar

- **Apple ile Giriş** şu an aktif değildir (bir Apple Developer hesabı + servis kimliği gerektirir).
  `src/services/auth.js` içindeki `signInWithApple` fonksiyonunda kurulum notları var.
- **Anne Sohbeti (CommunityChat)** şu an 4 saniyede bir "polling" ile yenileniyor; gerçek zamanlı
  anlık güncelleme için `src/services/storage.js` içindeki Firestore okumaları `onSnapshot` ile
  değiştirilebilir (performans/okuma maliyeti optimizasyonu).
   - **Admin Paneli** demo bir geçiş koduyla (`0000`) korunur — gerçek üretimde bunu Firebase
  Authentication'daki özel bir rol/claim (custom claim) ile değiştirmeniz güvenlik açısından
  önerilir.
- Gemini yanıtları şu an **streaming değil**; `api/gemini.js` ve `geminiService.js`
  `:streamGenerateContent` uç noktasına geçirilerek parça parça yanıt akışı eklenebilir.
