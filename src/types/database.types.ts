export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      content_items: {
        Row: {
          id: string
          created_at: string
          slug: string
          title: string
          script: string | null
          blog_html: string | null
          tags: string[] | null
          tts_audio_url: string | null
          shotstack_render_id: string | null
          video_url: string | null
          status: string
          error_message: string | null
          attempt_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          slug: string
          title: string
          script?: string | null
          blog_html?: string | null
          tags?: string[] | null
          tts_audio_url?: string | null
          shotstack_render_id?: string | null
          video_url?: string | null
          status?: string
          error_message?: string | null
          attempt_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          slug?: string
          title?: string
          script?: string | null
          blog_html?: string | null
          tags?: string[] | null
          tts_audio_url?: string | null
          shotstack_render_id?: string | null
          video_url?: string | null
          status?: string
          error_message?: string | null
          attempt_count?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
