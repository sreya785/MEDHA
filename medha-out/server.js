const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static('.'));  // serves the frontend

app.post('/generate-notes', async (req, res) => {
  const { dnaReport } = req.body;

  if (!dnaReport) {
    return res.status(400).json({ error: 'dnaReport is required' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      temperature: 0.4,
      messages: [
        {
          role: 'user',
          content: `You are AdmitIQ's study note generator. You receive a student's DNA exam report and generate structured study notes.

CRITICAL RULES:
1. Respond ONLY with valid JSON. No extra text, no markdown, no backticks.
2. Follow the exact output schema provided.
3. Never copy raw exam questions — derive the topic from the correct answer.
4. For confused questions, the comparisonTable first entry is ALWAYS the correct concept.
5. Include ALL options the student clicked as wrong columns in the table.
6. Keep explanations concise and student-friendly.
7. IMPORTANT: Write ALL study note content in Bangla (Bengali language). Topics, explanations, memory tricks, trap questions — everything in Bangla.

OUTPUT SCHEMA:
{
  "slow": [{ "topic": "", "explanation": "", "memoryTrick": "", "trapQuestion": "" }],
  "confused": [{ "topic": "", "comparisonTable": [{"concept":"","description":""}], "memoryTrick": "", "trapQuestion": "" }],
  "danger": [{ "topic": "", "explanation": "", "whyCorrect": "", "whyTricked": "", "trapQuestion": "" }]
}

DNA REPORT:
${JSON.stringify(dnaReport)}`
        }
      ]
    });

    const rawText = completion.choices[0].message.content;

    try {
      const notes = JSON.parse(rawText);
      return res.json({ notes });
    } catch (parseErr) {
      console.error('JSON parse failed:', rawText);
      return res.status(500).json({ error: 'AI response parsing failed' });
    }

  } catch (err) {
    console.error('Groq API error:', err);
    return res.status(500).json({ error: 'AI request failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`AdmitIQ server running on port ${PORT}`);
});