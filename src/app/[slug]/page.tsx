import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { Metadata } from 'next';
import VideoPlayer from '../../components/VideoPlayer';

export const revalidate = 3600; // 1 hour ISR

interface Props {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  
  const { data: post } = await supabase
    .from('content_items')
    .select('title, tags, script')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'published')
    .single();

  if (!post) {
    return { title: 'Not Found' };
  }

  // Ensure script exists before calling substring
  const scriptContent = post.script || '';
  const desc = scriptContent.length > 150 ? scriptContent.substring(0, 150) + '...' : scriptContent;

  return {
    title: `${post.title} | Superstition Blogger`,
    description: desc,
    openGraph: {
      title: post.title,
      description: desc,
      type: 'article',
      tags: post.tags || [],
    }
  };
}

export default async function VideoDetail({ params }: Props) {
  const resolvedParams = await params;

  // Fetch using the anon client. 
  // RLS ensures only 'status=published' is returned, but we query it explicitly too.
  const { data: post, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .eq('status', 'published')
    .single();

  if (error || !post) {
    notFound();
  }

  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="detail-container">
      <Link href="/" className="back-link">
        &larr; Back to all news
      </Link>
      
      <div className="video-player-container">
        {post.video_url ? (
          <VideoPlayer src={post.video_url} />
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', paddingTop: '20%' }}>
            Video unavailable
          </div>
        )}
      </div>

      <h1 className="detail-title">{post.title}</h1>
      
      <div className="detail-meta">
        <span>{formattedDate}</span>
        <div className="tags">
          {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <article 
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.blog_html || '' }}
      />
    </main>
  );
}
