import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Deepgram Speech-to-Text Utility
 * 
 * Provides high-accuracy transcription for:
 * - Voicemail recordings
 * - Call recordings
 * - Real-time speech analysis
 * 
 * API Key: b0e085008baa62122bb769ac64c4dbaf2f49831b
 */

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || 'b0e085008baa62122bb769ac64c4dbaf2f49831b';

export interface TranscriptionResult {
  transcript: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  duration: number;
}

/**
 * Transcribe audio from URL (e.g., Twilio recording)
 */
export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult | null> {
  try {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?punctuate=true&utterances=true&diarize=true&model=nova-2&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: audioUrl }),
      }
    );

    if (!response.ok) {
      console.error('[DEEPGRAM] API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    
    const result = data.results?.channels?.[0]?.alternatives?.[0];
    if (!result) {
      console.error('[DEEPGRAM] No transcription result');
      return null;
    }

    return {
      transcript: result.transcript || '',
      confidence: result.confidence || 0,
      words: result.words?.map((w: any) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
      })) || [],
      duration: data.metadata?.duration || 0,
    };
  } catch (err) {
    console.error('[DEEPGRAM] Transcription error:', err);
    return null;
  }
}

/**
 * Transcribe audio buffer (for uploaded files)
 */
export async function transcribeBuffer(audioBuffer: Buffer, contentType: string = 'audio/wav'): Promise<TranscriptionResult | null> {
  try {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?punctuate=true&utterances=true&model=nova-2&smart_format=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': contentType,
        },
        body: audioBuffer,
      }
    );

    if (!response.ok) {
      console.error('[DEEPGRAM] API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    const result = data.results?.channels?.[0]?.alternatives?.[0];
    if (!result) return null;

    return {
      transcript: result.transcript || '',
      confidence: result.confidence || 0,
      words: result.words?.map((w: any) => ({
        word: w.word,
        start: w.start,
        end: w.end,
        confidence: w.confidence,
      })) || [],
      duration: data.metadata?.duration || 0,
    };
  } catch (err) {
    console.error('[DEEPGRAM] Buffer transcription error:', err);
    return null;
  }
}

/**
 * Quick API test endpoint
 * POST /api/voice/test-deepgram
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: 'audioUrl required' });
  }

  console.log('[DEEPGRAM] Testing transcription for:', audioUrl);

  const result = await transcribeAudio(audioUrl);

  if (!result) {
    return res.status(500).json({ error: 'Transcription failed' });
  }

  res.status(200).json({
    success: true,
    transcript: result.transcript,
    confidence: result.confidence,
    wordCount: result.words.length,
    duration: result.duration,
  });
}
