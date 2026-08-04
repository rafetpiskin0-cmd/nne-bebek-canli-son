/* ============================================================
   api/gemini.js — Vercel Serverless Function (SUNUCU TARAFI)
   ------------------------------------------------------------
   geminiService.js (istemci) buraya POST atar: { system, messages }
   Bu dosya GEMINI_API_KEY'i Vercel ortam değişkenlerinden okur ve
   gerçek Gemini isteğini burada, sunucuda yapar — anahtar istemciye
   ASLA gönderilmez.

   Vercel Dashboard > Project > Settings > Environment Variables:
     GEMINI_API_KEY = <senin anahtarın>          (zorunlu, sunucu-only,
                                                    VITE_ öneki KOYMA —
                                                    yoksa istemciye
                                                    gömülür ve sızar!)
     GEMINI_MODEL   = gemini-2.0-flash            (opsiyonel, varsayılan aşağıda)
   ============================================================ */

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TIMEOUT_MS = 20000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }

  if (!GEMINI_API_KEY) {
    console.error("[api/gemini] GEMINI_API_KEY tanımlı değil (Vercel env vars kontrol et)");
    return res.status(500).json({ error: "server_misconfigured: GEMINI_API_KEY yok" });
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "invalid_request: messages boş olamaz" });
  }

  // geminiService.js "user" | "assistant" rolü gönderiyor, Gemini API
  // "user" | "model" bekliyor — burada dönüştürüyoruz.
  const contents = messages
    .filter((m) => m && typeof m.content === "string" && m.content.trim())
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0) {
    return res.status(400).json({ error: "invalid_request: geçerli mesaj içeriği yok" });
  }

  const payload = {
    contents,
    ...(system && typeof system === "string" && system.trim()
      ? { systemInstruction: { role: "system", parts: [{ text: system }] } }
      : {}),
    generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
    safetySettings: [
      // Uygulama hamilelik/bebek sağlığı içerikleri ürettiği için
      // varsayılan "medical" filtresini fazla agresif bulursan burayı
      // gevşetebilirsin; şimdilik Google varsayılanları kullanılıyor.
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const upstream = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      console.error("[api/gemini] upstream hata:", upstream.status, errText.slice(0, 500));
      // geminiService.js yalnızca 404/400'de retry YAPMIYOR; kalıcı
      // olmayan hatalarda (429, 500...) kendi tarafında retry deniyor
      // olsun diye bu durumlarda 502 ile dönüyoruz.
      const passthroughStatus = upstream.status === 404 || upstream.status === 400 ? upstream.status : 502;
      return res.status(passthroughStatus).json({
        error: `gemini_upstream_${upstream.status}`,
        detail: errText.slice(0, 300),
      });
    }

    const data = await upstream.json();
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("");

    if (!text) {
      const blockReason = data?.promptFeedback?.blockReason;
      if (blockReason) {
        console.warn("[api/gemini] içerik engellendi:", blockReason);
        return res.status(200).json({ text: "", blocked: true, reason: blockReason });
      }
    }

    return res.status(200).json({ text });
  } catch (e) {
    clearTimeout(timer);
    console.error("[api/gemini] beklenmeyen hata:", e);
    if (e.name === "AbortError") {
      return res.status(504).json({ error: "gemini_timeout" });
    }
    return res.status(500).json({ error: "internal_error" });
  }
}
