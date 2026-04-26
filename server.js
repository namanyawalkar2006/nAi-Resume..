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

// Mimic the Vercel API behavior
app.post('/api/gemini', async (req, res) => {
    const { prompt, config } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
        return res.status(500).json({ error: "Server not configured. API Key missing in .env" });
    }

    try {
        let data;
        if (groqKey) {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error?.message || `Groq API returned ${response.status}`);
            }

            const groqData = await response.json();
            data = {
                candidates: [{
                    content: {
                        parts: [{ text: groqData.choices[0].message.content }]
                    }
                }]
            };
        } else {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: config || {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 2048,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error?.message || `Gemini API returned ${response.status}`);
            }
            data = await response.json();
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
    }

    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    if (!geminiKey && !groqKey) {
        return res.status(500).json({ error: "Server not configured. API Key missing" });
    }

    try {
        if (groqKey) {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${groqKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: messages, // History included here
                    temperature: 0.7,
                })
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error?.message || `Groq API returned ${response.status}`);
            }

            const groqData = await response.json();
            return res.json({ reply: groqData.choices[0].message.content });
        } else {
            // For Gemini, we need to convert messages to Gemini format
            const contents = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents }),
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err?.error?.message || `Gemini API returned ${response.status}`);
            }
            const data = await response.json();
            return res.json({ reply: data.candidates[0].content.parts[0].text });
        }
    } catch (err) {
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});


app.listen(PORT, () => {
    console.log(`\n🚀 ResumeAI is running happily!`);
    console.log(`🔗 Local Link: http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop.\n`);
});
