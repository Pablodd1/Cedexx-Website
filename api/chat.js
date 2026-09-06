export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'en', provider } = req.body;
  
  // Get all API keys
  const KIMI_KEY = process.env.KIMI_API_KEY;
  const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const OPENAI_KEY = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const MINIMAX_KEY = process.env.MINIMAX_API_KEY;
  const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;

  const langInstruction = 
    language === 'es' ? "Responde en español profesional (Latinoamérica). " :
    language === 'ht' ? "Reponn an kreyòl ayisyen. " : "Respond in English. ";

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

  // Build provider list with available keys
  const availableProviders = [];
  if (DEEPSEEK_KEY) availableProviders.push({ name: 'deepseek', key: DEEPSEEK_KEY, model: 'deepseek-chat' });
  if (OPENAI_KEY) availableProviders.push({ name: 'openai', key: OPENAI_KEY, model: 'gpt-4o-mini' });
  if (KIMI_KEY) availableProviders.push({ name: 'kimi', key: KIMI_KEY, model: 'moonshot-v1-8k' });
  if (GEMINI_KEY) availableProviders.push({ name: 'gemini', key: GEMINI_KEY, model: 'gemini-1.5-flash' });
  if (MINIMAX_KEY) availableProviders.push({ name: 'minimax', key: MINIMAX_KEY, model: 'abab6.5s-chat' });

  // Select provider: requested > first available
  let selectedProvider = null;
  if (provider) {
    selectedProvider = availableProviders.find(p => p.name === provider) || availableProviders[0];
  } else {
    selectedProvider = availableProviders[0];
  }

  if (!selectedProvider) {
    console.error('[CHAT] No AI provider keys configured');
    const fallbackText = 'We are currently unavailable. Please try again in a moment or contact support at 954-624-6744 for immediate assistance.';
    return res.status(200).json({ choices: [{ message: { content: fallbackText } }] });
  }

  console.log(`[CHAT] Using provider: ${selectedProvider.name}`);

  try {
    // DeepSeek — PRIMARY
    if (selectedProvider.name === 'deepseek') {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CHAT] DeepSeek HTTP error:', response.status, errorText);
        throw new Error(`DeepSeek HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      console.error('[CHAT] DeepSeek unexpected response:', JSON.stringify(data).slice(0, 500));
      throw new Error('DeepSeek invalid response');
    }

    // OpenAI
    if (selectedProvider.name === 'openai') {
      const openaiKey = OPENAI_KEY;
      const useAzure = openaiKey.includes('azure') || process.env.AZURE_OPENAI_ENDPOINT;
      
      const response = await fetch(useAzure 
        ? `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15`
        : 'https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
          ...(useAzure && { 'api-key': openaiKey })
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      throw new Error('OpenAI invalid response');
    }

    // Kimi (Moonshot)
    if (selectedProvider.name === 'kimi') {
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Kimi HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      throw new Error('Kimi invalid response');
    }

    // Gemini (Google)
    if (selectedProvider.name === 'gemini') {
      const geminiMessages = messages.map(m => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      geminiMessages.unshift({ 
        role: 'user', 
        parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nYou are JasDex. Respond as instructed above.` }] 
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (reply) {
        return res.status(200).json({
          choices: [{ message: { content: reply } }]
        });
      }
      throw new Error('Gemini invalid response');
    }

    // MiniMax
    if (selectedProvider.name === 'minimax') {
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MiniMax HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return res.status(200).json(data);
      }
      throw new Error('MiniMax invalid response');
    }

    throw new Error('No matching provider handler');

  } catch (error) {
    console.error('[CHAT] Fatal error:', error.message);
    // Return a graceful fallback instead of 500
    const fallbackText = language === 'es' 
      ? 'Lo siento, estoy teniendo problemas técnicos. Por favor contacta a soporte al 954-624-6744.'
      : language === 'ht'
      ? 'Mwen regrèt, mwen gen pwoblèm teknik. Tanpri kontakte sipò nan 954-624-6744.'
      : 'I apologize, I\'m experiencing technical difficulties. Please contact support at 954-624-6744.';
    return res.status(200).json({ choices: [{ message: { content: fallbackText } }] });
  }
}
