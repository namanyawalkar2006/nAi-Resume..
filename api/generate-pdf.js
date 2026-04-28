const chromium = require('@sparticuz/chromium-min');
const puppeteer = require('puppeteer-core');

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { html } = req.body;
  if (!html) return res.status(400).json({ error: 'HTML is required' });

  let browser;
  try {
    // 🚀 ULTRA-LIGHTWEIGHT STRATEGY:
    // We use @sparticuz/chromium-min to keep the bundle small.
    // The binary is downloaded on-the-fly from GitHub.
    const executablePath = await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar');

    browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: chromium.defaultViewport,
      executablePath: executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(20000); // 20s
    await page.setContent(html, { waitUntil: 'load' });
    
    // Minimal margins to prevent overflow issues
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });

    await browser.close();
    res.setHeader('Content-Type', 'application/pdf');
    return res.send(pdf);
  } catch (error) {
    if (browser) await browser.close();
    console.error("BROWSER ERROR:", error);
    return res.status(500).json({ 
      error: "Server Error", 
      message: error.message,
      details: "Ensure Node 20 is used. " + (error.stack || "")
    });
  }
};
