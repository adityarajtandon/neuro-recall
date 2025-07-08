const OpenAI = require('openai');
const Tip = require('../models/Tip');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateBrainTips(userId) {
  // Prompt for OpenAI
  const prompt = `\nGive me 3 actionable, science-based brain optimization tips for learning, inspired by Andrew Huberman, neuroscience, and learning optimisation.\nFormat as a JSON array: [\"Tip 1...\", \"Tip 2...\", \"Tip 3...\"].\nNo extra text.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a neuroscience and learning optimization expert.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  let tips = [];
  try {
    let text = completion.choices[0].message.content.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    tips = JSON.parse(text);
  } catch (err) {
    throw new Error('Failed to parse OpenAI response for tips');
  }

  // Store each tip in DB
  const tipDocs = await Promise.all(
    tips.map(tip =>
      Tip.create({ userId, tip, generatedAt: new Date(), context: { source: 'openai' } })
    )
  );
  return tipDocs;
}

module.exports = { generateBrainTips }; 