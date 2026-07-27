/* ============================================================
   services/geminiService.js — İSTEMCİ TARAFI
   ------------------------------------------------------------
   Bu dosya GEMINI_API_KEY'i ASLA görmez ve içermez. Sadece kendi
   sunucumuzdaki (Vercel Serverless Function) /api/gemini rotasına
   istek atar; gerçek Gemini çağrısı ve API anahtarı orada, sunucu
   tarafında kalır (bkz. /api/gemini.js).
   ============================================================ */

const TIMEOUT_MS = 25000;
const MAX_RETRIES = 2;

function withTimeout(fn, ms) {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => { ctrl.abort(); reject(new Error("timeout")); }, ms);
    fn(ctrl.signal).then((v) => { clearTimeout(timer); resolve(v); }).catch((e) => { clearTimeout(timer); reject(e); });
  });
}

/**
 * @param {string} system - Sistem talimatı (persona/kurallar)
 * @param {Array<{role:"user"|"assistant", content:string}>} messages - Sohbet geçmişi
 * @returns {Promise<{ok:boolean, text?:string, error?:string}>}
 */
export async function callGemini(system, messages) {
  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await withTimeout(
        (signal) => fetch("/api/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal,
          body: JSON.stringify({ system, messages }),
        }),
        TIMEOUT_MS
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        // 404 (model artık yok) ve 400 (geçersiz istek) kalıcı hatalardır,
        // tekrar denemek kotayı boşuna tüketir — hemen çık.
        if (res.status === 404 || res.status === 400) {
          return { ok: false, error: `gemini_proxy_http_${res.status}${body ? ": " + body.slice(0, 200) : ""}` };
        }
        throw new Error(`gemini_proxy_http_${res.status}${body ? ": " + body.slice(0, 200) : ""}`);
      }
      const data = await res.json();
      return { ok: true, text: data.text || "" };
    } catch (e) {
      lastErr = e;
      if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
    }
  }
  console.error("[geminiService] başarısız:", lastErr);
  return { ok: false, error: lastErr ? lastErr.message : "unknown_error" };
}
