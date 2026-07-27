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

const GEMINI_MODEL = "gemini-2.5-flash";
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
      res.status(upstream.status).json({ error: "gemini_api_error", message: errText.slice(0, 500) });
      return;
    }

    const data = await upstream.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";

    res.status(200).json({ text });
  } catch (e) {
    clearTimeout(timeout);
    console.error("[api/gemini] beklenmeyen hata:", e);
    res.status(502).json({ error: "upstream_failed", message: String(e.message || e) });
  }
}
