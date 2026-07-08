import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from '../src/lib/supabase';

async function seedLocalhost() {
  console.log('🌱 Seeding a test blog post so you can view it on Localhost...');
  
  const today = new Date().toISOString().split('T')[0];
  const slug = `test-post-${today}`;

  // Clean up any existing row
  await supabaseAdmin.from('content_items').delete().eq('slug', slug);

  // The video URL we generated during our earlier Shotstack test!
  const testVideoUrl = 'https://shotstack-api-stage-output.s3-ap-southeast-2.amazonaws.com/xz3pgodylw/20c04da9-1c8c-46a8-88d3-b7b6ac150c5a.mp4';

  const mockBlogHtml = `
    <p>Welcome to today's test blog post! This content was instantly seeded so you could view the beautiful frontend design on localhost.</p>
    <h2>Glassmorphism UI</h2>
    <p>As you can see, the video player is seamlessly integrated into this clean, accessible detail page.</p>
    <ul>
      <li>Lightning-fast Server Components</li>
      <li>Incremental Static Regeneration (ISR)</li>
      <li>Vanilla CSS Premium Aesthetics</li>
    </ul>
    <h3>Automated Video</h3>
    <p>The video playing above was automatically generated using Shotstack via our Node.js scripts earlier today.</p>
  `;

  const { error } = await supabaseAdmin.from('content_items').insert({
      slug,
      title: 'Localhost Test Post: Experiencing the Frontend',
      script: 'Welcome to today\'s AI update! In an unprecedented move, tech giants have just announced a major collaboration on open-source large language models. This joint effort promises to accelerate AI development globally, making advanced tools accessible to millions of developers. Meanwhile, startups continue to disrupt the market with incredibly fast and efficient specialized models. The future of AI is moving faster than ever, and we\'re here to keep you updated. Thanks for watching, and stay tuned for more breakthroughs!',
      blog_html: mockBlogHtml,
      status: 'published',
      tags: ['Local', 'Frontend', 'Design'],
      video_url: testVideoUrl
  });

  if (error) {
    console.error('❌ Failed to seed post:', error);
  } else {
    console.log(`✅ Success!`);
    console.log(`\n🎉 Go to http://localhost:3000 to see the grid!`);
    console.log(`🎬 Go to http://localhost:3000/${slug} to watch the video!`);
  }
}

seedLocalhost();
