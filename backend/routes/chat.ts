// ═══════════════════════════════════════════════
// CEDEXX Backend — Chat Router
// Multi-provider AI chat with Gemini, Kimi, MiniMax, OpenAI
// ═══════════════════════════════════════════════

import { Router } from 'express';
import rateLimit from 'express-rate-limit';

export function createChatRouter() {
  const router = Router();

  // Chat endpoint
  router.post('/',
    rateLimit({ windowMs: 60 * 1000, max: 30 }), // 30 requests per minute
    async (req, res) => {
      const { messages, language = 'en', provider } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array required' });
      }

      // Get all API keys from environment
      const KIMI_KEY = process.env.KIMI_API_KEY;
      const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
      const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
      const MINIMAX_KEY = process.env.MINIMAX_API_KEY;

      const langInstruction =
        language === 'es' ? "Responde en español profesional (Latinoamérica). " :
        language === 'ht' ? "Reponn an kreyòl ayisyen. " :
        language === 'ru' ? "Отвечайте на русском языке. " :
        "Respond in English. ";

      const systemPrompt = `${langInstruction} You are JasDex, a warm and professional AI for Cedexx — powered by Lyric Health, our exclusive telehealth partner. No insurance needed.

Key facts about CEDEXX + Lyric Health:
- Cedexx is powered by Lyric Health, a leading integrated virtual primary care platform
- Lyric Health offers: 24/7 Urgent Care, Primary Care, Mental Health, Dermatology, Virtual MSK, Care Navigation, Labs, and GLP-1 Weight Loss
- Lyric Health's nationwide network includes licensed physicians, pediatricians, dermatologists, psychiatrists, and therapists with 10+ years average experience
- No insurance needed. Pricing: CareNow™ $18.99/mo, Mental Wellness $18.99/mo, CareNow+Mental $26.99/mo, CareComplete™ $34.99/mo, CareComplete Family™ $52.99/mo
- Contact: info@cedexx.net
- Cedexx is NOT a healthcare provider — we are the technology platform. Lyric Health delivers all medical care.
- NEVER give medical diagnoses or advice. Redirect medical questions to enrolling and speaking with Lyric Health providers.
- For emergencies, call 911
- Keep responses short (2-3 sentences).`;

      // Provider priority: Gemini > OpenAI > Kimi > MiniMax
      const providers = [
        { name: 'gemini', key: GEMINI_KEY, model: 'gemini-2.5-flash' },
        { name: 'openai', key: OPENAI_KEY, model: 'gpt-4o-mini' },
        { name: 'kimi', key: KIMI_KEY, model: 'moonshot-v1-8k' },
        { name: 'minimax', key: MINIMAX_KEY, model: 'abab6.5s-chat' }
      ];

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
        return res.status(200).json({
          choices: [{
            message: {
              content: 'We are currently unavailable. Please try again in a moment or contact support at info@cedexx.net for immediate assistance.'
            }
          }]
        });
      }

      try {
        // Gemini (Google) — PRIMARY
        if (selectedProvider.name === 'gemini' && GEMINI_KEY) {
          const geminiMessages = messages.map(m => ({
            role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));

          geminiMessages.unshift({
            role: 'user',
            parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nYou are JasDex. Respond as instructed above.` }]
          });

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: geminiMessages,
                generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
              })
            }
          );

          const data = await response.json() as any;
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
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{ role: 'system', content: systemPrompt }, ...messages],
              temperature: 0.3,
              max_tokens: 500
            })
          });

          const data = await response.json() as any;
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
              model: 'moonshot-v1-8k',
              messages: [{ role: 'system', content: systemPrompt }, ...messages],
              temperature: 0.3,
              max_tokens: 500
            })
          });

          const data = await response.json() as any;
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
              messages: [{ role: 'system', content: systemPrompt }, ...messages]
            })
          });

          const data = await response.json() as any;
          if (data.choices?.[0]?.message?.content) {
            return res.status(200).json(data);
          }
          throw new Error('MiniMax failed');
        }

        throw new Error('All providers failed');

      } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
          error: 'Failed to communicate with AI',
          fallback: true
        });
      }
    }
  );

  return router;
}
