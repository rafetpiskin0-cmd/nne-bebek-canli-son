/* ============================================================
   api/gemini.js — VERCEL SERVERLESS FUNCTION
   ------------------------------------------------------------
   Bu dosya bir Node.js sunucu ortamında (Vercel) çalışır; tarayıcıya
   ASLA gönderilmez. GEMINI_API_KEY, Vercel proje ayarlarında bir
   Environment Variable olarak tanımlanır (VITE_ öneki KULLANILMAZ,
   aksi halde istemci tarafına da gömülür).
   İstek gövdesi:  { system: string, messages: [{role, content}] }
   Yanıt gövdesi:  { text: string }
   ============================================================ */
// Model adı env değişkeninden okunur (Vercel > Settings > Environment Variables >
// GEMINI_MODEL). Google zaman zaman modelleri yeni API anahtarları için erken
// devre dışı bırakabiliyor (bkz. 404 "no longer available to new users" hatası);
// böyle bir durumda kodu değiştirmeden sadece bu env değişkenini güncelleyip
// yeniden deploy etmeniz yeterlidir. Varsayılan: gemini-3.1-flash-lite
// (yeni API anahtarları için Google'ın önerdiği, hızlı ve düşük maliyetli model).
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("[api/gemini] GEMINI_API_KEY tanımlı değil. Vercel > Settings > Environment Variables'a ekleyin.");
    res.status(500).json({ error: "server_misconfigured", message: "GEMINI_API_KEY tanımlı değil." });
    return;
  }

  const { system, messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "invalid_request", message: "messages alanı gerekli." });
    return;
  }

  // Anthropic mesaj biçimini (role: "user"|"assistant") Gemini'nin
  // beklediği contents/role: "user"|"model" biçimine çevir.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: String(m.content || "") }],
  }));

  const body = {
    contents,
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    generationConfig: { maxOutputTokens: 1200, temperature: 0.7 },
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const upstream = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      console.error("[api/gemini] Gemini API hatası:", upstream.status, errText);
      res.status(upstream.status).json({
        error: "upstream_error",
        message: `Gemini API isteği başarısız oldu (HTTP ${upstream.status}).`,
        details: errText,
      });
      return;
    }

    const data = await upstream.json();

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

    if (!text) {
      console.error("[api/gemini] Boş yanıt:", JSON.stringify(data));
      res.status(502).json({
        error: "empty_response",
        message: "Gemini modelinden metin içeren bir yanıt alınamadı.",
      });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    clearTimeout(timeout);
    const isAbort = err?.name === "AbortError";
    console.error("[api/gemini] İstek hatası:", err);
    res.status(isAbort ? 504 : 500).json({
      error: isAbort ? "timeout" : "internal_error",
      message: isAbort
        ? "Gemini API isteği zaman aşımına uğradı."
        : "Sunucu tarafında beklenmeyen bir hata oluştu.",
    });
  }
}
