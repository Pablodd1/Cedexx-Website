import express from 'express';
import { CEDEXX_KNOWLEDGE } from '../src/data/cedexx-knowledge';

const router = express.Router();

/**
 * POST /api/chat
 * AI chat endpoint — uses CEDEXX knowledge base for accurate responses
 */
router.post('/chat', async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'en', provider } = req.body;
  
  // Get all API keys
  const KIMI_KEY = process.env.KIMI_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const MINIMAX_KEY = process.env.MINIMAX_API_KEY;

  // Build comprehensive system prompt from real website knowledge
  const k = CEDEXX_KNOWLEDGE;
  
  const langInstruction = 
    language === 'es' ? "Responde en español profesional (Latinoamérica). " :
    language === 'ht' ? "Reponn an kreyòl ayisyen. " :
    language === 'ru' ? "Отвечайте на русском языке. " :
    "Respond in English. ";

  const systemPrompt = `${langInstruction}

You are Cedex, the CEDEXX Healthcare AI Assistant. You help customers learn about our telemedicine platform.

COMPANY: ${k.company.description}
Website: ${k.company.website} | Email: ${k.company.email} | Phone: ${k.company.phone}
Coverage: ${k.company.coverage} | Languages: ${k.company.languages.join(', ')}

FOUNDERS:
${k.founders.map(f => `- ${f.name}, ${f.role}: ${f.bio}`).join('\n')}

PRICING:
- Individual: ${k.pricing.individual}
- Family: ${k.pricing.family}
${k.pricing.notes.map(n => `- ${n}`).join('\n')}

6 CORE SERVICES:
${k.coreServices.map(s => `
${s.name}: ${s.description}
Conditions: ${s.conditions.join(', ')}
${s.restrictions ? `Restrictions: ${s.restrictions}` : ''}`).join('')}

HOW IT WORKS:
${k.howItWorks.map((step, i) => `${i + 1}. ${step}`).join('\n')}

PROPERTY & HOSPITALITY:
${k.propertyHospitality.description}
Segments: ${k.propertyHospitality.segments.join(', ')}

ENROLLMENT TYPES:
${k.enrollmentTypes.join(', ')}

SCHEDULE SLOTS (EST):
${k.scheduleSlots.join(', ')}

KEY BENEFITS:
${k.keyBenefits.map(b => `- ${b}`).join('\n')}

CRITICAL RULES:
${k.criticalRules.map(r => `- ${r}`).join('\n')}

VOICE GUIDELINES:
- Keep responses short (2-3 sentences max)
- Be warm, professional, and helpful
- NEVER give medical diagnoses or advice
- For emergencies, direct to 911 immediately
- If booking: collect name, email, phone, service type, date/time`;

  // Try providers in order of preference
  const providers = [
    // Gemini — PRIMARY (fast, cheap, medical-safe)
    { name: 'gemini', key: GEMINI_KEY, model: 'gemini-1.5-flash' },
    // OpenAI — Backup 1
    { name: 'openai', key: OPENAI_KEY, model: 'gpt-4o-mini' },
    // Kimi (Moonshot) — Backup 2
    { name: 'kimi', key: KIMI_KEY, model: 'moonshot-v1-8k' },
    // MiniMax — Backup 3
    { name: 'minimax', key: MINIMAX_KEY, model: 'abab6.5s-chat' }
  ];

  // Use requested provider or try available ones
  let selectedProvider = provider;
  if (!selectedProvider) {
    for (const p of providers) {
      if (p.key) {
        selectedProvider = p;
        break;
      }
    }
  } else {
    selectedProvider = providers.find(p => p.name === provider) || providers.find(p => p.key);
  }

  if (!selectedProvider?.key) {
    const fallbackText = 'We are currently unavailable. Please try again in a moment or contact support at 954-624-6744 for immediate assistance.';
    return res.status(200).json({ choices: [{ message: { content: fallbackText } }] });
  }

  try {
    // Gemini (Google) — PRIMARY
    if (selectedProvider.name === 'gemini' && GEMINI_KEY) {
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Add system prompt as first user message (Gemini doesn't have system role)
      geminiMessages.unshift({ 
        role: 'user', 
        parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nYou are Cedex. Respond as instructed above.` }] 
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (reply) {
        return res.status(200).json({
          choices: [{ message: { content: reply } }]
        });
      }
      throw new Error('Gemini failed');
    }

    // OpenAI
    if (selectedProvider.name === 'openai' && OPENAI_KEY) {
      const useAzure = OPENAI_KEY.includes('azure') || process.env.AZURE_OPENAI_ENDPOINT;
      
      const response = await fetch(useAzure 
        ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15`
        : 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`,
          ...(useAzure && { 'api-key': OPENAI_KEY })
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      throw new Error('OpenAI failed');
    }

    // Kimi (Moonshot)
    if (selectedProvider.name === 'kimi' && KIMI_KEY) {
      const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${KIMI_KEY}`
        },
        body: JSON.stringify({
          model: "moonshot-v1-8k",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      throw new Error('Kimi failed');
    }

    // MiniMax
    if (selectedProvider.name === 'minimax' && MINIMAX_KEY) {
      const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MINIMAX_KEY}`
        },
        body: JSON.stringify({
          model: 'abab6.5s-chat',
          messages: [{ role: "system", content: systemPrompt }, ...messages]
        })
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      throw new Error('MiniMax failed');
    }

    throw new Error('All providers failed');

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI' });
  }
});

export default router;
