import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * POST /api/voice/ai-assistant
 * AI-powered voice conversation handler
 * Receives caller speech text, returns AI response as Twilio XML
 * 
 * Flow:
 * 1. Caller speaks → Twilio records
 * 2. Twilio sends speech text to this endpoint
 * 3. This endpoint calls Gemini AI
 * 4. Returns Twilio XML with AI response spoken
 */

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

function twiml(xml: string) {
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${xml}</Response>`;
}

// CEDEXX Knowledge Base for AI
const CEDEXX_KNOWLEDGE = `
You are JasDex, the CEDEXX Healthcare AI Assistant. You help callers learn about our telemedicine platform.

COMPANY:
- CEDEXX is powered by Lyric Health, a leading integrated virtual primary care platform
- We offer: 24/7 Urgent Care, Primary Care, Mental Health, Dermatology, Virtual MSK, Care Navigation, Labs, and GLP-1 Weight Loss
- Pricing: Individual $18.99/month, Family $34.99/month (up to 7 members)
- Contact: support@cedexx.net
- No insurance needed, HIPAA Secure through Lyric Health, 24/7 access
- Coverage: Available in most US states

HOW IT WORKS:
1. Sign up at cedexx.net/enroll
2. Download Lyric Health app
3. Connect with a provider in minutes
4. Get prescriptions sent to your pharmacy

IMPORTANT RULES:
- NEVER give medical diagnoses or advice
- For emergencies, direct to 911 immediately
- Keep responses short (2-3 sentences max)
- Be warm, professional, and helpful
- If they want to enroll, direct them to cedexx.net/enroll
- If they need a human, offer to take a message
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { SpeechResult, Confidence, CallSid, From } = req.body;

  console.log('[VOICE AI] Received speech:', {
    callSid: CallSid,
    speech: SpeechResult?.substring(0, 100),
    confidence: Confidence,
    from: From,
  });

  if (!SpeechResult) {
    // No speech detected, ask again
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">I didn't catch that. Could you please repeat?</Say>
      <Gather input="speech" action="/api/voice/ai-assistant" speechTimeout="3" language="en-US">
        <Say voice="Polly.Joanna">What can I help you with today?</Say>
      </Gather>
      <Say voice="Polly.Joanna">I didn't hear a response. Please call back or text us. Goodbye!</Say>
      <Hangup/>
    `));
    return;
  }

  try {
    // Get AI response from Gemini
    const aiResponse = await getAIResponse(SpeechResult);

    // Build Twilio response
    const twilioResponse = `
      <Say voice="Polly.Joanna">${escapeXml(aiResponse)}</Say>
      <Gather input="speech" action="/api/voice/ai-assistant" speechTimeout="3" language="en-US">
        <Say voice="Polly.Joanna">What else can I help you with? Or press star to leave a message.</Say>
      </Gather>
      <Say voice="Polly.Joanna">Thank you for calling Ceedex, powered by Lyric Health. Have a healthy day!</Say>
      <Hangup/>
    `;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(twilioResponse));

  } catch (err) {
    console.error('[VOICE AI ERROR]', err);
    
    // Fallback response
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(twiml(`
      <Say voice="Polly.Joanna">
        I'm sorry, I'm having trouble understanding. Please visit ceedex dot net or text us for assistance. Thank you for calling!
      </Say>
      <Hangup/>
    `));
  }
}

// ─── Call Gemini API ───
async function getAIResponse(userSpeech: string): Promise<string> {
  if (!GEMINI_KEY) {
    return "Thank you for calling Ceedex. For enrollment, visit ceedex dot net slash enroll. For support, email support at cedexx dot net.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: `SYSTEM: ${CEDEXX_KNOWLEDGE}\n\nCaller said: "${userSpeech}"\n\nRespond as JasDex, the CEDEXX AI assistant. Keep it to 2-3 sentences maximum.` }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 150,
          }
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (reply) {
      return reply.trim();
    }

    throw new Error('Empty AI response');

  } catch (err) {
    console.error('[GEMINI ERROR]', err);
    return "I apologize, I'm having trouble right now. Please visit cedexx dot net or call back later.";
  }
}

// Escape XML special characters for Twilio
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
