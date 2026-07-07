import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateContentStub(prompt: string) {
  return `Stubbed generation for: ${prompt}`;
}
