import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateAudio(script: string): Promise<Buffer> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [{ text: script }]
      }
    ],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Kore'
          }
        }
      }
    }
  });

  // Extract inline audio data from the response
  const candidate = response.candidates?.[0];
  if (!candidate?.content?.parts) {
    throw new Error('No audio parts returned from Gemini TTS');
  }

  for (const part of candidate.content.parts) {
    if (part.inlineData && part.inlineData.mimeType?.startsWith('audio/')) {
      const base64Audio = part.inlineData.data;
      if (!base64Audio) throw new Error('Empty audio data from Gemini TTS');
      return Buffer.from(base64Audio, 'base64');
    }
  }

  throw new Error('No audio data found in Gemini TTS response');
}
