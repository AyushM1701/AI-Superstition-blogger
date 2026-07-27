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

// ── Slug safety ──────────────────────────────────────────────────────────────
// Only allow the same character set used when generating slugs in generate-daily.ts
const VALID_SLUG = /^[a-z0-9-]+$/;

// ── Simple in-process rate limiter ───────────────────────────────────────────
// Limits each IP to MAX_POSTS_PER_WINDOW requests per WINDOW_MS.
// NOTE: This resets on cold-start. For a production-grade solution use Vercel KV.
const WINDOW_MS = 60_000; // 1 minute
const MAX_POSTS_PER_WINDOW = 3;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= MAX_POSTS_PER_WINDOW) return true;
  entry.count++;
  return false;
}

// ── Input limits ─────────────────────────────────────────────────────────────
const MAX_AUTHOR_LEN = 60;
const MAX_TEXT_LEN = 600;

const COMMENTS_DIR = process.env.VERCEL
  ? path.join('/tmp', 'comments')
  : path.join(process.cwd(), 'data/comments');

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

  if (!slug || !VALID_SLUG.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
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
  // ── Rate limiting ──────────────────────────────────────────────────────────
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment before asking again.' },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { slug, author, text } = body;

  if (!slug || !author || !text) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // ── Slug validation ────────────────────────────────────────────────────────
  if (!VALID_SLUG.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  // ── Input length limits ────────────────────────────────────────────────────
  if (author.length > MAX_AUTHOR_LEN) {
    return NextResponse.json({ error: `Name must be ${MAX_AUTHOR_LEN} characters or fewer.` }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LEN) {
    return NextResponse.json({ error: `Question must be ${MAX_TEXT_LEN} characters or fewer.` }, { status: 400 });
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

  // Always answer the user's question
  const post = getPostBySlug(slug);
  const postContext = post ? `${post.title}\n\n${post.blog_html}` : 'No context available';

  const aiAnswer = await answerQuestion(postContext, sanitizedText);
  newComment.aiReply = aiAnswer;

  comments.push(newComment);
  await fsPromises.writeFile(filePath, JSON.stringify(comments, null, 2));

  return NextResponse.json(newComment);
}
