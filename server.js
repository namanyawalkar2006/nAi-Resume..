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
// LIGHTNING-FAST AI ENGINE
app.post('/api/gemini', async (req, res) => {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    try {
        let result = await (async () => {
             // Try Groq Instant
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
             // Fallback to Gemini Flash
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

// PDF Generation Endpoint (Server-side Puppeteer)
app.post('/api/generate-pdf', async (req, res) => {
    const { html } = req.body || {};
    if (!html) return res.status(400).json({ error: "HTML content is required" });

    let browser;
    try {
        const puppeteer = require('puppeteer-core');
        let executablePath = "";
        
        try {
            const chromium = require('@sparticuz/chromium-min');
            executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar');
        } catch (e) {
            // Fallback for Railway (Linux) or Local (Windows)
            if (process.platform === 'linux') {
                executablePath = '/usr/bin/google-chrome-stable'; // Standard Railway path
            } else {
                executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"; 
            }
        }

        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: executablePath,
            headless: 'new'
        });
        const page = await browser.newPage();
        
        // Use networkidle0 to ensure all dynamic assets/fonts are loaded
        await page.setContent(html, { waitUntil: 'networkidle0' });
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Resume.pdf"');
        res.send(pdfBuffer);
    } catch (err) {
        if (browser) await browser.close();
        console.error("Puppeteer PDF Error:", err);
        res.status(500).json({ error: "Failed to generate PDF on server. " + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 ResumeAI is running happily!`);
    console.log(`🔗 Local Link: http://localhost:${PORT}`);
    console.log(`\nPress Ctrl+C to stop.\n`);
});
