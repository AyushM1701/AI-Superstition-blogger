import * as googleTTS from 'google-tts-api';

export async function generateAudio(script: string): Promise<Buffer> {
  try {
    // Generate base64 audio string (split if > 200 chars to bypass limit)
    const results = await googleTTS.getAllAudioBase64(script, {
      lang: 'en', // English
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    });

    // Combine base64 chunks into a single Buffer
    const buffers = results.map((res) => Buffer.from(res.base64, 'base64'));
    return Buffer.concat(buffers);
  } catch (error: any) {
    throw new Error(`Failed to generate Google TTS audio: ${error.message}`);
  }
}
