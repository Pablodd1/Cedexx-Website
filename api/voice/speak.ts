import type { VercelRequest, VercelResponse } from '@vercel/node';

const XAI_API_KEY = process.env.XAI_API_KEY || process.env.GROK_API_KEY || '';
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'b0e085008baa62122bb769ac64c4dbaf2f49831b';

// In-memory cache for frequently spoken phrases
const audioCache = new Map<string, Buffer>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const text = (req.query.text as string || req.body?.text as string || '').trim();
  const voice = (req.query.voice as string || req.body?.voice as string || process.env.GROK_VOICE || 'ara').trim();
  if (!text) {
    return res.status(400).send('Missing text parameter');
  }

  const cacheKey = `${voice}:${text.toLowerCase()}`;
  if (audioCache.has(cacheKey)) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(audioCache.get(cacheKey));
  }

  try {
    // Priority 1: xAI Grok Voice 3.0 Standalone TTS ($15 / 1M chars — https://api.x.ai/v1/tts)
    if (XAI_API_KEY) {
      try {
        const grokRes = await fetch('https://api.x.ai/v1/tts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${XAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            voice_id: voice,
            language: 'auto',
          }),
        });

        if (grokRes.ok) {
          const ab = await grokRes.arrayBuffer();
          const buf = Buffer.from(ab);
          if (audioCache.size < 100) audioCache.set(cacheKey, buf);
          res.setHeader('Content-Type', 'audio/mpeg');
          res.setHeader('X-Voice-Provider', 'grok-voice-3.0');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.status(200).send(buf);
        }
        console.warn('[GROK SPEAK] Fallback to Deepgram, status:', grokRes.status);
      } catch (grokErr) {
        console.warn('[GROK SPEAK] Fallback to Deepgram:', grokErr);
      }
    }

    // Priority 2: Deepgram Flux / Aura-2 Fallback
    const deepgramUrl = 'https://api.deepgram.com/v2/speak?model=flux-hannah-en&speed=1.0&expressivity=1.0';
    const response = await fetch(deepgramUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[DEEPGRAM SPEAK] API Error:', response.status, errText);
      return res.status(500).send(`Deepgram error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (audioCache.size < 100) {
      audioCache.set(cacheKey, buffer);
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-Voice-Provider', 'deepgram');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(buffer);
  } catch (err: any) {
    console.error('[VOICE SPEAK] Exception:', err);
    return res.status(500).send('Failed to synthesize speech');
  }
}
