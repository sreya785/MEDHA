# AdmitIQ — Backend API Notes for Replit
# ==========================================
# Build a Node.js + Express backend and connect it to this frontend.
# The frontend is complete. You only need to build the backend.

## Stack Required
- Node.js + Express
- Groq SDK (npm install groq-sdk)
- cors (npm install cors)
- dotenv (npm install dotenv)

## Project Structure
admitiq/
├── index.html         ← frontend (already done)
├── css/style.css      ← frontend (already done)
├── js/               ← frontend (already done)
│   ├── questions.js
│   ├── tracker.js
│   ├── dna.js
│   ├── notes.js
│   └── app.js
├── server.js          ← YOU BUILD THIS
├── .env               ← YOU CREATE THIS
└── package.json       ← YOU CREATE THIS

## Environment Variables (.env)
GROQ_API_KEY=your_groq_api_key_here
PORT=3000

## server.js — What to Build

```javascript
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
  // See ENDPOINT DETAILS below
});

app.listen(process.env.PORT || 3000);
```

## ENDPOINT: POST /generate-notes
==========================================

### What the frontend sends:
```json
{
  "dnaReport": {
    "slow": [
      {
        "questionId": 1,
        "questionText": "Which molecule carries...",
        "options": ["tRNA", "mRNA", "rRNA", "snRNA"],
        "correctAnswerIndex": 1,
        "correctAnswerText": "mRNA",
        "finalAnswerIndex": 0,
        "finalAnswerText": "tRNA",
        "timeTaken": 18.4,
        "clickSequence": ["A", "C", "B"],
        "isCorrect": true,
        "switchCount": 2
      }
    ],
    "confused": [ ...same shape... ],
    "danger":   [ ...same shape... ]
  }
}
```

### What the backend must send back:
```json
{
  "notes": {
    "slow": [
      {
        "topic": "RNA types and their roles",
        "explanation": "One-line simple explanation of the correct concept.",
        "memoryTrick": "A memorable trick to remember this.",
        "trapQuestion": "A reworded future exam-style trap question?"
      }
    ],
    "confused": [
      {
        "topic": "Photosynthesis vs similar processes",
        "comparisonTable": [
          { "concept": "Photosynthesis",      "description": "Makes food using sunlight" },
          { "concept": "Cellular respiration","description": "Releases energy from food using oxygen" },
          { "concept": "Fermentation",        "description": "Releases small energy without oxygen" },
          { "concept": "Transpiration",       "description": "Removes water vapor from leaves" }
        ],
        "memoryTrick": "A memorable trick.",
        "trapQuestion": "A reworded future exam-style trap question?"
      }
    ],
    "danger": [
      {
        "topic": "S phase and DNA replication",
        "explanation": "3-4 line simple explanation of the correct concept.",
        "whyCorrect": "Why the correct answer is right.",
        "whyTricked": "Why students get tricked by the wrong answer.",
        "trapQuestion": "A reworded future exam-style trap question?"
      }
    ]
  }
}
```

## GROQ PROMPT TO USE
==========================================
Send this system prompt to Groq. Replace {DNA_DATA} with JSON.stringify(dnaReport).

```
You are AdmitIQ's study note generator. You receive a student's DNA exam report and generate structured study notes.

CRITICAL RULES:
1. Respond ONLY with valid JSON. No extra text, no markdown, no backticks.
2. Follow the exact output schema provided.
3. Never copy raw exam questions — derive the topic from the correct answer.
4. For confused questions, the comparisonTable first entry is ALWAYS the correct concept.
5. Include ALL options the student clicked as wrong columns in the table.
6. Keep explanations concise and student-friendly.

OUTPUT SCHEMA:
{
  "slow": [{ "topic": "", "explanation": "", "memoryTrick": "", "trapQuestion": "" }],
  "confused": [{ "topic": "", "comparisonTable": [{"concept":"","description":""}], "memoryTrick": "", "trapQuestion": "" }],
  "danger": [{ "topic": "", "explanation": "", "whyCorrect": "", "whyTricked": "", "trapQuestion": "" }]
}

DNA REPORT:
{DNA_DATA}
```

## GROQ MODEL
- Model: llama-3.1-70b-versatile
- max_tokens: 2000
- temperature: 0.4

## IMPORTANT NOTES
- API key must NEVER be in frontend files
- Parse the Groq response as JSON before sending back to frontend
- If JSON parse fails, return { error: "AI response parsing failed" } with status 500
- The frontend handles the error state — just send proper error status codes

## IMPORTANT: Language
- All study note content (topic, explanation, memoryTrick, trapQuestion, whyCorrect, whyTricked, comparisonTable descriptions) must be written in **Bangla (Bengali)**.
- Add this line to the system prompt: "IMPORTANT: Write ALL study note content in Bangla (Bengali language). Topics, explanations, memory tricks, trap questions — everything in Bangla."
