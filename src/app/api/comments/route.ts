import { NextResponse } from 'next/server';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { getPostBySlug } from '@/lib/posts';
import { answerQuestion } from '@/lib/gemini';
import { sanitizeContent } from '@/lib/sanitize';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  aiReply?: string;
}

const COMMENTS_DIR = path.join(process.cwd(), 'data/comments');

// Helper to get path
function getCommentsPath(slug: string) {
  return path.join(COMMENTS_DIR, `${slug}.json`);
}

// Helper to ensure dir exists
async function ensureCommentsDir() {
  if (!fs.existsSync(COMMENTS_DIR)) {
    await fsPromises.mkdir(COMMENTS_DIR, { recursive: true });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
  }

  const filePath = getCommentsPath(slug);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json([]);
  }

  try {
    const data = await fsPromises.readFile(filePath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json({ error: 'Failed to read comments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { slug, author, text } = body;

  if (!slug || !author || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Sanitize user inputs to prevent any backend script injection
  const sanitizedAuthor = sanitizeContent(author).replace(/<[^>]*>?/gm, '').trim(); 
  const sanitizedText = sanitizeContent(text).replace(/<[^>]*>?/gm, '').trim();

  if (!sanitizedAuthor || !sanitizedText) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }

  await ensureCommentsDir();
  const filePath = getCommentsPath(slug);
  
  let comments: Comment[] = [];
  if (fs.existsSync(filePath)) {
    try {
      const data = await fsPromises.readFile(filePath, 'utf8');
      comments = JSON.parse(data);
    } catch {
      // ignore parsing errors, start fresh
    }
  }

  const newComment: Comment = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    author: sanitizedAuthor,
    text: sanitizedText,
    createdAt: new Date().toISOString(),
  };

  // AI Question check
  if (sanitizedText.toLowerCase().startsWith('/question')) {
    const questionText = sanitizedText.substring('/question'.length).trim();
    if (!questionText) {
      newComment.aiReply = "The spirits need a specific question to answer. Please ask something after '/question'.";
    } else {
      // Get the post to give context to Gemini
      const post = getPostBySlug(slug);
      const postContext = post ? `${post.title}\n\n${post.blog_html}` : 'No context available';
      
      const aiAnswer = await answerQuestion(postContext, questionText);
      newComment.aiReply = aiAnswer;
    }
  }

  comments.push(newComment);
  await fsPromises.writeFile(filePath, JSON.stringify(comments, null, 2));

  return NextResponse.json(newComment);
}
