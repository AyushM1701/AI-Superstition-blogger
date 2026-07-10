import * as googleTTS from 'google-tts-api';

export async function generateAudio(script: string): Promise<Buffer> {
  try {
    // Generate base64 audio string (split if > 200 chars to bypass limit)
    const results = await googleTTS.getAllAudioBase64(script, {
      lang: 'hi', // google-tts-api doesn't support 'en-IN', 'hi' gives an Indian accent for English text
      slow: false,
      host: 'https://translate.google.com',
      timeout: 10000,
    });

    // Combine base64 chunks into a single Buffer
    const buffers = results.map((res) => Buffer.from(res.base64, 'base64'));
    return Buffer.concat(buffers);
  } catch (error) {
    console.error('TTS Generation Error:', error);
    throw new Error(`Failed to generate TTS: ${error instanceof Error ? error.message : String(error)}`);
  }
}
