-- Create the content_items table
CREATE TABLE content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    script TEXT,
    blog_html TEXT,
    tags TEXT[] DEFAULT '{}',
    tts_audio_url TEXT,
    shotstack_render_id TEXT,
    video_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    error_message TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add indexes on status and created_at
CREATE INDEX idx_content_items_status ON content_items(status);
CREATE INDEX idx_content_items_created_at ON content_items(created_at);

-- Enable Row-Level Security
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for anon role
CREATE POLICY "Anon can view published content"
    ON content_items
    FOR SELECT
    TO anon
    USING (status = 'published');
