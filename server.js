/* ============================================
   VERABRIEF — server.js
   Secure backend proxy for Anthropic API.
   API key lives here only — never in the browser.
   ============================================ */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve index.html, styles.css, app.js as static files
app.use(express.static('.'));

/* ── TRANSLATE ENDPOINT ── */
app.post('/translate', async (req, res) => {
  const { reportText } = req.body;

  if (!reportText || !reportText.trim()) {
    return res.status(400).json({ error: 'No report text provided.' });
  }

  if (reportText.length > 50000) {
    return res.status(400).json({ error: 'Report too long. Maximum 50,000 characters.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'API key not configured. Check your .env file.' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: `You are Verabrief, a cybersecurity report translator.
Your job is to convert dense technical security reports into clear,
plain-English executive briefs that business owners can act on immediately.
Always respond with valid JSON only — no markdown, no explanation, no extra text.`,
        messages: [{
          role:    'user',
          content: `Convert the following technical security report into a structured executive brief.

Respond with this exact JSON and nothing else:
{
  "risk": "CRITICAL or HIGH or MEDIUM or LOW",
  "riskClass": "risk-critical or risk-high or risk-medium or risk-low",
  "financial": "$X estimated exposure",
  "financialSub": "one line explanation",
  "systems": "X systems or accounts affected",
  "systemsSub": "brief description",
  "window": "response timeframe e.g. NOW or <4hrs or 48hrs",
  "windowSub": "why this timeframe matters",
  "compliance": "compliance risk level or regulation triggered",
  "complianceSub": "which regulations are affected",
  "complianceColor": "red or yellow or green",
  "summary": "2-3 sentences a business owner can understand and act on",
  "actions": [
    "Action 1 written for a non-technical business owner",
    "Action 2",
    "Action 3",
    "Action 4",
    "Action 5"
  ]
}

REPORT:
${reportText}`
        }]
      })
    });

    const data  = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', data);
      return res.status(502).json({ error: 'AI service error. Please try again.' });
    }

    const text  = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const brief = JSON.parse(clean);

    res.json(brief);

  } catch (err) {
    console.error('Translation error:', err);
    res.status(500).json({ error: 'Translation failed. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`\n✅ Verabrief running at http://localhost:${PORT}`);
  console.log(`   API key loaded: ${process.env.ANTHROPIC_API_KEY ? 'YES ✓' : 'NO ✗ — check your .env file'}\n`);
});