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
   ${previousTitles.length ? previousTitles.map(t => `   - ${t}`).join('\n') : 'None'}

4. 'blog_html' should use standard HTML tags (p, h2, h3, ul, li, strong, em). Make the blog post engaging, spooky, but educational, explaining the cultural or historical roots in India.

5. IMPORTANT: Do NOT start 'blog_html' with a heading that repeats the title. The title is rendered separately. Start 'blog_html' directly with a <p> tag or a sub-heading like <h3>.

6. IMAGE PROMPT ENGINEERING — 'image_prompts' MUST be an array of EXACTLY 5 prompts. These are sent to an AI image generator (Flux model). Follow these rules precisely:

7. 'tags' MUST be exactly 3–5 tags — the most specific, distinctive ones for
   this particular superstition (e.g. the specific ritual/belief name), not
   generic category labels. Avoid near-duplicates like using both "Indian
   Folklore" and "Indian Traditions" in the same post.

   STORY ARC (5 shots):
   - Shot 1 (ESTABLISHING): Wide cinematic landscape or interior establishing the Indian setting. Golden hour or dramatic lighting. Show the environment where the superstition takes place.
   - Shot 2 (CHARACTER): Close-up or medium shot of an Indian person (specific age, clothing, expression) performing or encountering the superstition ritual.
   - Shot 3 (THE RITUAL): The superstition in action — the specific object, gesture, or event. Dramatic angle, shallow depth of field.
   - Shot 4 (SUPERNATURAL): A mystical, ethereal, or fantastical visualization of the belief — what people imagine will happen. Use surreal lighting, mist, golden particles, translucent spirits.
   - Shot 5 (RESOLUTION): The aftermath — a peaceful, reverent, or contemplative scene showing the cultural significance. Warm, hopeful tones.

   PROMPT QUALITY RULES:
   - Each prompt must be 30-60 words, highly specific and CONCRETE — describe exactly what is happening, who is doing it, and with what object, before anything else.
   - CRITICAL: Every single shot (even the supernatural/resolution ones) MUST explicitly name the specific ritual object or action to prevent the AI from drifting into generic atmospheric scenes.
   - Do NOT include art-style or medium keywords (no "photography," "cinematic," "film," "illustration," etc.) — a consistent illustration style is applied automatically downstream. Focus every word budget on subject, action, setting, and composition instead.
   - Specify: camera framing/angle, time of day, specific Indian setting (village courtyard, temple threshold, kitchen doorway, etc.), and the exact gesture or object central to the ritual.
   - Specify emotional tone in plain terms: "ominous," "reverent," "serene," "mysterious," "sacred"
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

export async function answerQuestion(postContext: string, question: string): Promise<string> {
  const model = "gemini-2.5-flash";
  const ai = getGeminiClient();
  
  const systemPrompt = `You are the mystical, wise AI narrator of TONA TOTKA, an Indian folklore and superstitions blog.
A user has asked a question in the comment section of a specific blog post.
Your job is to answer their question using the context of the blog post and your vast knowledge of Indian superstitions, myths, and folklore.

CONSTRAINTS:
1. Keep the answer concise (2-4 sentences max).
2. Maintain a mystical, respectful, but informative tone.
3. Only use plain text or very light markdown (bolding/italics). No headers or complex formatting.`;

  const userPrompt = `Blog Post Context:
${postContext}

User's Question:
${question}

Answer the question:`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text || "I'm sorry, the spirits are quiet today and I cannot answer that.";
  } catch (error) {
    console.error('Gemini Q&A Error:', error);
    return "The mystical energies are disrupted. Please try asking again later.";
  }
}
