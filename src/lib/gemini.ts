import { GoogleGenAI } from '@google/genai';
import { ContentSchema, Content } from '../types/content';
import { sanitizeContent } from './sanitize';

function getGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
export async function generateContent(previousTitles: string[] = []): Promise<Content> {
  const model = "gemini-2.5-flash";
  
  const systemPrompt = `You are a mystical blogger and narrator focused on Indian superstitions, local folklore, and myths (Tona Totka).
Your task is to generate a fascinating blog post and a matching narration script about a unique Indian superstition (e.g., black cats, hanging lemons and chilies, sweeping after sunset).
CRITICAL CONSTRAINTS:
1. Output MUST be valid JSON matching this schema:
{
  "title": "string",
  "script": "string",
  "blog_html": "string",
  "tags": ["string"],
  "image_prompts": ["string", "string", "string", "string"]
}
2. The 'script' field MUST be capped at roughly 80-90 words (designed to be spoken in under 35 seconds).
3. Do NOT repeat the following recent titles: ${previousTitles.length ? previousTitles.join(', ') : 'None'}.
4. 'blog_html' should use standard HTML tags (p, h2, h3, ul, li, strong, em). Make the blog post engaging, spooky, but educational, explaining the cultural or historical roots in India.
5. 'image_prompts' MUST be an array of EXACTLY 4 highly detailed, cinematic, 8k prompts describing a sequential visual storyboard that perfectly captures the superstition's progression. No text or words in the prompts. Ensure subjects look Indian.`;

  const callGemini = async (promptMsg: string) => {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model,
      contents: promptMsg,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });
    return response.text;
  };

  try {
    const rawResult = await callGemini("Generate a captivating blog post about a famous or obscure Indian superstition (Tona Totka).");
    if (!rawResult) throw new Error("Empty response from Gemini");
    
    // Parse and validate
    const parsed = JSON.parse(rawResult);
    let validated = ContentSchema.safeParse(parsed);
    
    if (!validated.success) {
      // Retry once
      console.warn("Validation failed, retrying once...", validated.error.message);
      const retryPrompt = `Generate today's AI news blog post. 
PREVIOUS ATTEMPT FAILED VALIDATION. Ensure it strictly matches the JSON schema. Error: ${validated.error.message}`;
      
      const retryResult = await callGemini(retryPrompt);
      if (!retryResult) throw new Error("Empty response from Gemini on retry");
      
      const retryParsed = JSON.parse(retryResult);
      validated = ContentSchema.safeParse(retryParsed);
      if (!validated.success) {
        throw new Error(`Validation failed after retry: ${validated.error.message}`);
      }
    }

    const finalData = validated.data;
    // Pipe blog_html through sanitize-html immediately after generation
    finalData.blog_html = sanitizeContent(finalData.blog_html);
    
    return finalData;
  } catch (error: any) {
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}
