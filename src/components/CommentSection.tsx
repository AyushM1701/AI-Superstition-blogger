'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  aiReply?: string;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Simple markdown parser for AI replies
function parseLightMarkdown(text: string) {
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>'); // italics
  return html;
}

export default function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/comments?slug=${slug}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        } else {
          setError('Failed to load past whispers.');
        }
      } catch (e) {
        setError('Failed to connect to the mystical realm.');
        console.error('Failed to fetch comments', e);
      } finally {
        setFetching(false);
      }
    };
    fetchComments();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, author, text })
      });
      
      if (res.ok) {
        const newComment = await res.json();
        setComments([...comments, newComment]);
        setText(''); // Keep author name for future comments
      } else {
        const errData = await res.json();
        setError(errData.error || 'The spirits rejected your whisper. Please try again.');
      }
    } catch (e) {
      setError('Connection disrupted. Please try again later.');
      console.error('Failed to post comment', e);
    } finally {
      setLoading(false);
    }
  };

  const reversedComments = [...comments].reverse();

  return (
    <div className="comment-section">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="comment-toggle-btn"
        aria-expanded={isOpen}
      >
        <h3 className="comment-title" style={{ margin: 0 }}>
          Ask the Spirits {comments.length > 0 && `(${comments.length})`}
        </h3>
        <span className="toggle-icon" style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>
      
      {isOpen && (
        <div className="comment-content" style={{ marginTop: '1.5rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: 'var(--bg-2)', color: 'var(--accent-2)', border: '1px solid var(--accent-2)', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="comment-form">
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Your Name" 
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="comment-input"
              />
            </div>
            <div className="form-group">
              <textarea 
                placeholder="Ask the AI Narrator a question about this post..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={4}
                className="comment-textarea"
              />
            </div>
            <button type="submit" disabled={loading} className="comment-submit">
              {loading ? 'Consulting the spirits...' : 'Ask Question'}
            </button>
          </form>

          <div className="comment-list">
            {fetching ? (
              <p className="comment-loading">Summoning past questions...</p>
            ) : comments.length === 0 ? (
              <p className="comment-empty">Be the first to ask a question.</p>
            ) : (
              reversedComments.map((comment) => (
                <div key={comment.id} className="comment-card">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  
                  {comment.aiReply && (
                    <div className="ai-reply">
                      <div className="ai-reply-header">✨ The Narrator Answers:</div>
                      <p 
                        className="ai-reply-text" 
                        dangerouslySetInnerHTML={{ __html: parseLightMarkdown(comment.aiReply) }} 
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
