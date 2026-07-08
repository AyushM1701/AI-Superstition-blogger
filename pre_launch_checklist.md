# Pre-Launch Checklist

Before promoting the AI Blogger application to a production environment, complete all items in this checklist.

## 1. Vercel Environment Variables
Ensure the following variables are set securely in your Vercel Project Settings (Production Environment):
- [ ] `GEMINI_API_KEY`: A valid Google AI Studio key.
- [ ] `SUPABASE_URL`: Your Supabase project URL.
- [ ] `SUPABASE_ANON_KEY`: Your Supabase public anonymous key (safe for client side).
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase secret service role key (bypasses RLS).
- [ ] `CRON_SECRET`: A secure, randomly generated string.

## 2. Shotstack Configuration
- [ ] **Swap API Key**: Ensure `SHOTSTACK_API_KEY` in Vercel is set to your **Production** key, not the Sandbox key.
- [ ] **Set Environment**: Set `SHOTSTACK_ENV=v1` (or `production`) instead of `stage` in Vercel.

## 3. Webhook & Cron Configuration
- [ ] **Webhook Domain**: Set the `WEBHOOK_URL` env var to your production domain (e.g., `https://your-domain.com/api/webhook`).
- [ ] **Cron Schedule**: Confirm `vercel.json` crons are correctly recognized in the Vercel dashboard.
- [ ] **CRON_SECRET Verification**: Ensure `/api/cron` and `/api/sweeper` both validate the `CRON_SECRET` locally before processing requests.

## 4. Supabase Setup
- [ ] **Migrations Applied**: Confirm the `content_items` table is created in your production Supabase instance.
- [ ] **Storage Bucket**: Ensure the `audio` storage bucket is created and set to **Public**.
- [ ] **Row-Level Security (RLS)**: Verify RLS is active on `content_items` and the `anon` SELECT policy strictly enforces `status = 'published'`.

## 5. Dry Run
- [ ] Perform a manual End-to-End dry run using a Postman or cURL request to your Vercel production domain's `/api/cron` endpoint (passing the `CRON_SECRET` Bearer token).
- [ ] Confirm the webhook successfully delivers to your production domain and publishes the post.
