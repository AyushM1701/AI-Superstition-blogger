import { GoogleGenAI } from '@google/genai';
import { ContentSchema, Content } from '../types/content';
import { sanitizeContent } from './sanitize';

function getGeminiClient() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
export async function generateContent(previousTitles: string[] = []): Promise<Content> {
  const model = "gemini-2.5-flash";
  
  const systemPrompt = `You are a mystical blogger and narrator focused on Indian superstitions, local folklore, and myths (Tona Totka).
Your task is to generate a fascinating blog post and a matching narration script about a unique Indian superstition (e.g., black cats, hanging lemons and chilies, sweeping after sunset, breaking glass, twitching eye, crow on the wall, sneezing before leaving).

CRITICAL CONSTRAINTS:
1. Output MUST be valid JSON matching this schema:
{
  "title": "string",
  "script": "string",
  "blog_html": "string",
  "tags": ["string"],
  "image_prompts": ["string", "string", "string", "string", "string"]
}

2. The 'script' field MUST be capped at roughly 80-90 words (designed to be spoken in under 35 seconds).

3. CRITICAL: Do NOT cover a topic that is the same as, or highly similar to, any of the following previously covered topics:
   ${previousTitles.length ? previousTitles.join('\\n   - ') : 'None'}

4. 'blog_html' should use standard HTML tags (p, h2, h3, ul, li, strong, em). Make the blog post engaging, spooky, but educational, explaining the cultural or historical roots in India.

5. IMPORTANT: Do NOT start 'blog_html' with a heading that repeats the title. The title is rendered separately. Start 'blog_html' directly with a <p> tag or a sub-heading like <h3>.

6. IMAGE PROMPT ENGINEERING — 'image_prompts' MUST be an array of EXACTLY 5 prompts. These are sent to an AI image generator (Flux model). Follow these rules precisely:

   STORY ARC (5 shots):
   - Shot 1 (ESTABLISHING): Wide cinematic landscape or interior establishing the Indian setting. Golden hour or dramatic lighting. Show the environment where the superstition takes place.
   - Shot 2 (CHARACTER): Close-up or medium shot of an Indian person (specific age, clothing, expression) performing or encountering the superstition ritual.
   - Shot 3 (THE RITUAL): The superstition in action — the specific object, gesture, or event. Dramatic angle, shallow depth of field.
   - Shot 4 (SUPERNATURAL): A mystical, ethereal, or fantastical visualization of the belief — what people imagine will happen. Use surreal lighting, mist, golden particles, translucent spirits.
   - Shot 5 (RESOLUTION): The aftermath — a peaceful, reverent, or contemplative scene showing the cultural significance. Warm, hopeful tones.

   PROMPT QUALITY RULES:
   - Each prompt must be 40-80 words, highly specific
   - Specify: camera angle, lighting type, time of day, Indian ethnicity/clothing/setting
   - Include style keywords: "cinematic lighting, shallow depth of field, 35mm film, volumetric light, National Geographic photography"
   - Specify emotional tone: "ominous, reverent, serene, mysterious, sacred"
   - NEVER include any text, words, letters, watermarks, or UI elements in the prompt
   - NEVER use names of real people or celebrities
   - Always describe subjects as Indian with appropriate traditional attire (saree, kurta, dhoti, etc.) and cultural elements (diyas, rangoli, temple, village, etc.)`;

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
      const retryPrompt = `Generate a captivating blog post about an Indian superstition (Tona Totka). 
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
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    throw new Error(`Failed to generate script: ${error instanceof Error ? error.message : String(error)}`);
  }
}
