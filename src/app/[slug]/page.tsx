import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPostBySlug, getAllPosts } from '../../lib/posts';
import ReelsPlayer from '../../components/ReelsPlayer';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const desc = post.script.length > 150 ? post.script.substring(0, 150) + '...' : post.script;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tona-totka.com';
  
  // Default to Pollinations URL if we don't have local static images yet
  let ogImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(post.title + ", cinematic, 8k")}?width=1200&height=630&nologo=true`;
  if (post.image_urls && post.image_urls.length > 0) {
    ogImage = `${baseUrl}${post.image_urls[0]}`;
  }

  return {
    title: `${post.title} | TONA TOTKA.COM`,
    description: desc,
    openGraph: {
      title: post.title,
      description: desc,
      images: [{ url: ogImage }],
    }
  };
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="detail-container">
      <Link href="/" className="back-link">
        ← Back to Archive
      </Link>
      
      <article>
        <header className="detail-header">
          <h1 className="detail-title">{post.title}</h1>
          <div className="detail-meta">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <div className="tags">
              {post.tags && post.tags.map((tag: string) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </header>

        <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'center' }}>
          <ReelsPlayer 
            imagePrompts={post.image_prompts || []} 
            imageUrls={post.image_urls}
            audioUrl={post.audio_url}
            durationInSeconds={35}
          />
        </div>

        <div 
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.blog_html }}
        />
      </article>
    </main>
  );
}
