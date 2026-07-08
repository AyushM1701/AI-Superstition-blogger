import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generateContent } from '../src/lib/gemini';
import { generateAudio } from '../src/lib/tts';
import { getAllPosts } from '../src/lib/posts';

async function generateDaily() {
  console.log('🔮 Starting TONA TOTKA Daily Content Generation...');

  try {
    const previousPosts = getAllPosts();
    const previousTitles = previousPosts.map(p => p.title).slice(0, 10);

    console.log('🧠 1. Calling Gemini to generate a superstition story...');
    const content = await generateContent(previousTitles);
    console.log(`✅ Gemini generated: "${content.title}"`);

    console.log('🎙️ 2. Fetching TTS Audio...');
    const audioBuffer = await generateAudio(content.script);
    
    // Setup paths
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const baseSlug = content.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${dateStr}-${baseSlug}`;

    const publicAudioDir = path.join(process.cwd(), 'public/audio');
    if (!fs.existsSync(publicAudioDir)) {
      fs.mkdirSync(publicAudioDir, { recursive: true });
    }

    const audioFilename = `${slug}.mp3`;
    const audioPath = path.join(publicAudioDir, audioFilename);
    const audioUrl = `/audio/${audioFilename}`;

    console.log('💾 3. Saving Audio to public/audio...');
    fs.writeFileSync(audioPath, audioBuffer);

    console.log('🖼️ 4. Fetching and Saving Static Images...');
    const publicImagesDir = path.join(process.cwd(), 'public/images', slug);
    if (!fs.existsSync(publicImagesDir)) {
      fs.mkdirSync(publicImagesDir, { recursive: true });
    }

    const imageUrls: string[] = [];
    for (let i = 0; i < content.image_prompts.length; i++) {
      const prompt = content.image_prompts[i];
      const encodedPrompt = encodeURIComponent(prompt + ", cinematic, highly detailed, 8k, professional photography");
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1920&height=1080&nologo=true`;
      
      try {
        const response = await fetch(pollinationsUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const imageBuffer = await response.arrayBuffer();
        
        const imageFilename = `${i + 1}.jpg`;
        const imagePath = path.join(publicImagesDir, imageFilename);
        fs.writeFileSync(imagePath, Buffer.from(imageBuffer));
        
        imageUrls.push(`/images/${slug}/${imageFilename}`);
        console.log(`  Saved image ${i + 1}/4`);
      } catch (err) {
        console.error(`  Failed to fetch image ${i + 1}, fallback to direct URL`, err);
        imageUrls.push(pollinationsUrl); // Fallback to remote URL if download fails
      }
    }

    console.log('💾 5. Saving Content to data/posts...');
    const postsDir = path.join(process.cwd(), 'data/posts');
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    const postPayload = {
      ...content,
      created_at: new Date().toISOString(),
      audio_url: audioUrl,
      image_urls: imageUrls
    };

    const postPath = path.join(postsDir, `${slug}.json`);
    fs.writeFileSync(postPath, JSON.stringify(postPayload, null, 2));

    console.log(`✅ Success! Post saved to ${postPath}`);

  } catch (error) {
    console.error('❌ Failed to generate daily content:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

generateDaily();
