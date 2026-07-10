import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { generateContent } from '../src/lib/gemini';
import { generateAudio } from '../src/lib/tts';
import { getAllPosts } from '../src/lib/posts';
import { buildImagePrompt } from '../src/lib/image-style';

async function generateDaily() {
  console.log('🔮 Starting TONA TOTKA Daily Content Generation...');

  try {
    const previousPosts = getAllPosts();
    const previousTitles = previousPosts.map(p => p.title);

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
      // Add the Alchemist's Terminal style modifiers to get woodcut ink sketches
      const encodedPrompt = encodeURIComponent(buildImagePrompt(prompt));
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1920&nologo=true`;
      
      try {
        console.log(`Waiting 10s before downloading image ${i+1} to respect Pollinations rate limits...`);
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const response = await fetch(imageUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const buffer = await response.arrayBuffer();
        const localPath = path.join(publicImagesDir, `${i + 1}.jpg`);
        fs.writeFileSync(localPath, Buffer.from(buffer));
        imageUrls.push(`/images/${slug}/${i + 1}.jpg`);
        console.log(`✅ Downloaded image ${i + 1}`);
      } catch (error) {
        console.error(`⚠️ Failed to download image ${i + 1}:`, error instanceof Error ? error.message : String(error));
        imageUrls.push(imageUrl); // Fallback to remote URL if download fails
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
