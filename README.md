# 🔮 TONA TOTKA.COM

An automated, AI-powered platform uncovering the truth behind Indian folklore, myths, and superstitions.

This application is built with **Next.js 15 (App Router)** and features a fully automated content pipeline. Every day, the system leverages AI to generate an original blog post about an Indian superstition ("Tona Totka"), complete with an interactive multimedia reading experience.



## ✨ Features

- **Automated Content Pipeline:** A daily GitHub Actions cron job orchestrates the generation of an entire blog post.
- **AI Storytelling:** Uses [Google Gemini AI](https://deepmind.google/technologies/gemini/) to research, write, and format deep dives into Indian superstitions.
- **Cinematic Visuals:** Automatically generates stunning 16:9 8k cinematic imagery using [Pollinations AI](https://pollinations.ai/) based on context-aware prompts.
- **Immersive Audio Narration:** Converts the blog content into a high-quality voiceover using Google Cloud Text-to-Speech (TTS).
- **Interactive "Reels" Player:** A custom widescreen media player that syncs the generated images with the voiceover, creating a "Ken Burns" cinematic panning effect.
- **Premium Glassmorphic UI:** Modern, mystical, and beautiful dark-mode interface built with custom CSS.
- **Static Site Generation (SSG):** All posts are pre-rendered into static JSON and HTML at build time for lightning-fast performance via Vercel.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (React 19)
- **Styling:** Vanilla CSS (Glassmorphic dark aesthetic)
- **AI Text:** `@google/genai` (Gemini 2.5 Flash)
- **AI Images:** Pollinations AI (Free API)
- **AI Audio:** `google-tts-api` (Google Translate TTS)
- **Deployment:** Vercel
- **Automation:** GitHub Actions

## 🛠️ Local Development

### Prerequisites

You will need Node.js installed, as well as API keys for Gemini and Google Cloud.

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-superstition-blogger.git
   cd ai-superstition-blogger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```
    *Note: You only need `GEMINI_API_KEY` for content generation. TTS uses the free Google Translate API.*

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🤖 How the Automation Works

The content is generated entirely without human intervention! 

1. **Trigger:** A GitHub Action triggers every day.
2. **Generation:** It executes `npm run generate` (running `scripts/generate-daily.ts`).
3. **Pipeline:**
   - **Gemini** selects a random Indian superstition and writes a script + HTML blog content, along with 4 image prompts.
   - **Pollinations.ai** receives the prompts and generates 1920x1080 cinematic images.
   - **Google Cloud TTS** synthesizes the voiceover MP3.
   - The results are bundled into a `.json` file in `data/posts/` and media is saved to `public/`.
4. **Commit:** The GitHub Action automatically commits the new JSON and media files back to the `main` branch.
5. **Deploy:** Vercel detects the new commit and rebuilds the static site, rendering the new post to the web.

## 📝 Scripts

- `npm run dev`: Starts local development server.
- `npm run build`: Builds the static site for production.
- `npm run generate`: Triggers the AI pipeline to create a single new post and save it locally.
- `npm run lint`: Runs ESLint across the project.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---
*Built with magic, AI, and Next.js.*
