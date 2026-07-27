import fs from 'fs';
import path from 'path';
import { buildPollinationsImageUrl } from '../src/lib/image-style';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fixBrokenImages() {
  const postsDir = path.join(process.cwd(), 'data/posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const postPath = path.join(postsDir, file);
    const post = JSON.parse(fs.readFileSync(postPath, 'utf8'));
    const slug = file.replace('.json', '');

    const imageDir = path.join(process.cwd(), `public/images/${slug}`);
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }

    // Ensure image_urls array exists and is the right length
    if (!Array.isArray(post.image_urls)) {
      post.image_urls = new Array(post.image_prompts.length).fill(null);
    }

    let postModified = false;

    for (let i = 0; i < post.image_prompts.length; i++) {
      const localPath = path.join(imageDir, `${i + 1}.jpg`);

      let needsDownload = false;
      if (!fs.existsSync(localPath)) {
        needsDownload = true;
      } else {
        const stats = fs.statSync(localPath);
        if (stats.size < 10000) { // Less than 10KB means it's likely an error JSON
          needsDownload = true;
        }
      }

      if (needsDownload) {
        console.log(`Fixing broken image ${i + 1} for ${slug}... waiting 10s for rate limits...`);
        await delay(10000);

        const prompt = post.image_prompts[i];
        const url = buildPollinationsImageUrl(prompt, 1920, 1080);

        console.log(`Downloading...`);
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.error(`Status ${response.status}`);
            continue;
          }
          const buffer = await response.arrayBuffer();
          fs.writeFileSync(localPath, Buffer.from(buffer));
          console.log(`Saved ${localPath} (${buffer.byteLength} bytes)`);

          // Update image_urls in the post to point to the local path
          const localUrl = `/images/${slug}/${i + 1}.jpg`;
          post.image_urls[i] = localUrl;
          postModified = true;
          console.log(`Updated image_urls[${i}] → ${localUrl}`);
        } catch (err) {
          console.error(`Failed to download image ${i + 1}`, err);
        }
      } else {
        // Ensure the JSON already reflects the local URL (fix legacy posts)
        const expectedLocalUrl = `/images/${slug}/${i + 1}.jpg`;
        if (post.image_urls[i] !== expectedLocalUrl) {
          post.image_urls[i] = expectedLocalUrl;
          postModified = true;
          console.log(`Fixed image_urls[${i}] for ${slug} → ${expectedLocalUrl}`);
        }
      }
    }

    if (postModified) {
      fs.writeFileSync(postPath, JSON.stringify(post, null, 2));
      console.log(`✅ Updated post JSON for ${slug}`);
    }
  }
}

fixBrokenImages().catch(console.error);
