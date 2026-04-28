module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  async function callAI(model, key, url) {
      if (!key) return null;
      try {
          const body = model.includes("gemini") 
            ? { contents: [{ parts: [{ text: prompt }] }] }
            : { model: model, messages: [{ role: "user", content: prompt }], temperature: 0.6 };

          const resp = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...(key && !model.includes("gemini") ? { "Authorization": `Bearer ${key}` } : {}) },
              body: JSON.stringify(body)
          });

          if (!resp.ok) return null;
          const data = await resp.json();
          
          if (model.includes("gemini")) return data;
          return {
              candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }]
          };
      } catch (e) { return null; }
  }

  try {
    // 🚀 SPEED-FIRST STRATEGY
    // 1. Try Llama 8B Instant (Lightning Fast)
    let data = await callAI("llama-3.1-8b-instant", groqKey, "https://api.groq.com/openai/v1/chat/completions");
    
    // 2. Try Gemini Flash (Next fastest)
    if (!data) {
        data = await callAI("gemini-1.5-flash", geminiKey, `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`);
    }

    if (!data) throw new Error("Engines busy");
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "AI Busy" });
  }
}
