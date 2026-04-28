const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Endpoints
app.post('/api/gemini', async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    try {
        let result = await (async () => {
             if (groqKey) {
                 const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                     method: "POST",
                     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
                     body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "user", content: prompt }], temperature: 0.6 })
                 });
                 if (resp.ok) {
                     const data = await resp.json();
                     return { candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }] };
                 }
             }
             if (geminiKey) {
                 const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                 });
                 if (resp.ok) return await resp.json();
             }
             return null;
        })();
        if (!result) return res.status(503).json({ error: "AI Busy" });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Fail" });
    }
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 ResumeAI is running happily!`);
        console.log(`🔗 Local Link: http://localhost:${PORT}`);
        console.log(`\nPress Ctrl+C to stop.\n`);
    });
}

module.exports = app;
