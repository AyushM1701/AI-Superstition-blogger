import fs from 'fs';
import path from 'path';

export interface Post {
  slug: string;
  title: string;
  script: string;
  blog_html: string;
  tags: string[];
  image_prompts: string[];
  image_urls?: string[];
  created_at: string;
  audio_url?: string;
}

const postsDirectory = path.join(process.cwd(), 'data/posts');

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  
  const allPostsData = fileNames
    .filter(fileName => fileName.endsWith('.json'))
    .map(fileName => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      try {
        const postData = JSON.parse(fileContents);
        // The slug is the filename without .json
        const slug = fileName.replace(/\.json$/, '');
        return {
          slug,
          ...postData
        } as Post;
      } catch (e) {
        console.error(`Error parsing JSON in file ${fileName}`);
        return null;
      }
    })
    .filter((post): post is Post => post !== null);

  // Sort posts by date, descending
  return allPostsData.sort((a, b) => {
    if (a.created_at < b.created_at) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getPostBySlug(slug: string): Post | null {
  const fullPath = path.join(postsDirectory, `${slug}.json`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  try {
    const postData = JSON.parse(fileContents);
    return {
      slug,
      ...postData
    } as Post;
  } catch (e) {
    console.error(`Error parsing JSON in file ${slug}.json`);
    return null;
  }
}
