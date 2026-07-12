import re

css_content = \"\"\":root {
  --bg: #070a17;
  --bg-2: #0e1226;
  --card-bg: #121736;
  --text-primary: #e6e6ef;
  --text-secondary: #8b8fb0;
  --accent: #d7c17a;
  --accent-2: #566aa8;
  --card-border: #232a52;
  --accent-gradient: var(--accent);
  
  --bg-color: var(--bg);
  --accent-color: var(--accent);
  --accent-hover: var(--accent-2);
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

a:focus-visible, button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

body {
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family: var(--font-body);
  line-height: 1.8;
  min-height: 100vh;
}

/* Background Layer */
.header {
  position: relative;
  padding: 2rem 0;
  text-align: center;
  margin-bottom: 3rem;
}

.header::before {
  content: url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 90 L40 50 L80 80' fill='none' stroke='%238b8fb0' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='10' cy='90' r='1' fill='%238b8fb0' opacity='0.2'/%3E%3Ccircle cx='40' cy='50' r='1.5' fill='%238b8fb0' opacity='0.2'/%3E%3Ccircle cx='80' cy='80' r='1' fill='%238b8fb0' opacity='0.2'/%3E%3Cpath d='M30 10 L60 30 L90 10' fill='none' stroke='%238b8fb0' stroke-width='0.5' opacity='0.2'/%3E%3Ccircle cx='30' cy='10' r='1' fill='%238b8fb0' opacity='0.2'/%3E%3Ccircle cx='60' cy='30' r='1.5' fill='%238b8fb0' opacity='0.2'/%3E%3Ccircle cx='90' cy='10' r='1' fill='%238b8fb0' opacity='0.2'/%3E%3C/svg%3E\");
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.reels-player {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid var(--card-border);
  margin: 0 auto 2rem;
}

.reels-viewport { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.reels-slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: opacity 0.5s ease-in-out; }
.reels-slide img { width: 100%; height: 100%; object-fit: cover; }

.kb-zoom-in { transform-origin: center center; animation: kbZoomIn 10s ease-out forwards; }
.kb-pan-left { transform-origin: center center; animation: kbPanLeft 10s ease-out forwards; }
.kb-pan-right { transform-origin: center center; animation: kbPanRight 10s ease-out forwards; }
.kb-zoom-out { transform-origin: center center; animation: kbZoomOut 10s ease-out forwards; }
.kb-pan-up { transform-origin: center center; animation: kbPanUp 10s ease-out forwards; }

@keyframes kbZoomIn { 0% { transform: scale(1); } 100% { transform: scale(1.18); } }
@keyframes kbPanLeft { 0% { transform: scale(1.15) translateX(3%); } 100% { transform: scale(1.15) translateX(-3%); } }
@keyframes kbPanRight { 0% { transform: scale(1.15) translateX(-3%); } 100% { transform: scale(1.15) translateX(3%); } }
@keyframes kbZoomOut { 0% { transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes kbPanUp { 0% { transform: scale(1.15) translateY(3%); } 100% { transform: scale(1.15) translateY(-3%); } }

.reels-subtitle {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 25;
  max-width: 85%;
  text-align: center;
  padding: 0.6rem 1.2rem;
  background: var(--bg-2);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.01em;
  animation: subtitleFadeIn 0.4s ease-out;
  pointer-events: none;
}

@keyframes subtitleFadeIn {
  0% { opacity: 0; transform: translateX(-50%) translateY(8px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@media (max-width: 768px) {
  .reels-subtitle {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
    bottom: 1.5rem;
    max-width: 90%;
  }
}

.reels-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 20;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(to bottom, rgba(7,10,23,0.4) 0%, transparent 20%, transparent 80%, rgba(7,10,23,0.6) 100%);
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  background: var(--bg-2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--accent);
  border: 1px solid var(--accent);
}

.progress-bar-container { display: flex; gap: 4px; width: 100%; margin-top: 4px; }
.progress-segment { flex: 1; height: 3px; background: rgba(230, 230, 239, 0.3); border-radius: 2px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent-color); border-radius: 2px; }

.single-layout { display: flex; flex-direction: column; gap: 2rem; margin-bottom: 4rem; }

.split-blog {
  background: var(--card-bg);
  padding: 3.5rem;
  border-radius: 8px;
  border: 1px solid var(--card-border);
}

.section-title {
  font-family: var(--font-body);
  font-size: 2rem;
  color: var(--accent-color);
  margin-bottom: 2rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

@media (max-width: 1024px) {
  .split-blog { padding: 2rem; }
}

h1, h2, h3, h4, h5, h6 { font-family: var(--font-head); margin-bottom: 1rem; line-height: 1.2; }
a { color: inherit; text-decoration: none; }

.container { max-width: 1200px; margin: 0 auto; padding: 2rem; width: 100%; }

.video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }

.video-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s ease;
  display: flex;
  flex-direction: column;
}

.video-card:hover { border-color: var(--accent-2); }

.card-content { padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; }

.card-title {
  font-family: var(--font-head);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: var(--text-primary);
  transition: color 0.2s ease;
}

.video-card:hover .card-title { color: var(--accent); }

.tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: auto; }

.tag {
  background: var(--bg-2);
  color: var(--accent-2);
  border: 1px solid var(--card-border);
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-container { max-width: 800px; margin: 0 auto; padding: 2rem; }
.back-link { display: inline-flex; align-items: center; color: var(--text-secondary); font-weight: 500; margin-bottom: 2rem; transition: color 0.2s ease; }
.back-link:hover { color: var(--text-primary); }
.detail-title { font-size: 2.5rem; margin-bottom: 1rem; font-family: var(--font-head); }
.detail-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--card-border); color: var(--text-secondary); font-family: var(--font-body); }

.blog-content { font-size: 1.125rem; color: var(--text-secondary); font-family: var(--font-body); }
.blog-content p { margin-bottom: 1.8rem; letter-spacing: 0.01em; }
.blog-content h2 { font-size: 1.8rem; margin-top: 3.5rem; margin-bottom: 1.25rem; color: var(--accent-hover); font-family: var(--font-head); font-weight: 600; }
.blog-content h3 { font-size: 1.4rem; margin-top: 2.5rem; margin-bottom: 1rem; color: var(--text-primary); font-family: var(--font-head); font-weight: 600; }
.blog-content ul, .blog-content ol { margin-bottom: 1.8rem; padding-left: 1.5rem; }
.blog-content li { margin-bottom: 0.75rem; }
.blog-content a { color: var(--accent-color); text-decoration: underline; text-decoration-color: transparent; transition: text-decoration-color 0.2s; }
.blog-content a:hover { text-decoration-color: var(--accent-color); }

.thumbnail-image { width: 100%; aspect-ratio: 16/9; object-fit: cover; display: block; border-bottom: 1px solid var(--card-border); }

.skeleton-title { width: 200px; height: 3rem; background: var(--card-bg); border-radius: 8px; margin: 0 auto 1rem; animation: pulse 1.5s ease-in-out infinite; }
.skeleton-subtitle { width: 320px; height: 1.2rem; background: var(--card-bg); border-radius: 6px; margin: 0 auto; animation: pulse 1.5s ease-in-out infinite; }
.skeleton-card { pointer-events: none; }
.skeleton-pulse { animation: pulse 1.5s ease-in-out infinite; }
.skeleton-line { background: var(--card-bg); border-radius: 4px; animation: pulse 1.5s ease-in-out infinite; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }

@media (max-width: 768px) {
  .container { padding: 1rem; }
  .header h1 { font-size: 2.25rem; }
  .header p { font-size: 1rem; }
  .video-grid { grid-template-columns: 1fr; gap: 1.25rem; }
  .detail-container { padding: 1rem; }
  .detail-title { font-size: 1.75rem; }
  .detail-meta { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .blog-content { font-size: 1rem; }
  .blog-content h2 { font-size: 1.5rem; }
  .blog-content h3 { font-size: 1.25rem; }
}

@media (max-width: 480px) {
  .header { margin-bottom: 1.5rem; padding: 1rem 0; }
  .header h1 { font-size: 1.75rem; }
  .card-title { font-size: 1.1rem; }
  .card-content { padding: 1rem; }
  .tag { font-size: 0.65rem; padding: 0.2rem 0.5rem; }
}

.reading-time {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--accent);
  text-transform: uppercase;
  font-family: var(--font-body);
  font-weight: 500;
  letter-spacing: 1px;
}

.share-bar { display: flex; align-items: center; gap: 0.75rem; margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid var(--card-border); flex-wrap: wrap; }
.share-bar-label { font-size: 0.9rem; font-weight: 600; color: var(--text-secondary); margin-right: 0.25rem; font-family: var(--font-body); }
.share-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600; cursor: pointer; border: 1px solid var(--card-border); background: var(--bg-2); color: var(--text-primary); transition: all 0.2s ease; font-family: var(--font-body); }
.share-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }
.share-btn--copied { border-color: var(--accent-2); color: var(--accent-2); }

.site-footer { margin-top: 5rem; padding: 2.5rem 0; border-top: 1px solid var(--card-border); text-align: center; color: var(--text-secondary); font-size: 0.85rem; font-family: var(--font-body); }
.site-footer p { margin-bottom: 0.5rem; }
.site-footer a { color: var(--accent-color); transition: color 0.2s ease; }
.site-footer a:hover { color: var(--accent-hover); }

/* Comment Section */
.comment-section { margin-top: 3rem; padding: 2rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--card-border); }
.comment-toggle-btn { width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; padding: 0.5rem 0; cursor: pointer; margin-bottom: 1.5rem; text-align: left; }
.comment-toggle-btn:hover .comment-title { color: var(--accent-hover); }
.comment-toggle-btn:focus { outline: none; }
.comment-title { font-size: 1.8rem; font-family: var(--font-head); color: var(--accent-color); }
.comment-form { margin-bottom: 3rem; }
.form-group { margin-bottom: 1.2rem; }
.comment-input, .comment-textarea { width: 100%; padding: 1rem; background: var(--bg-2); border: 1px solid var(--card-border); border-radius: 8px; color: var(--text-primary); font-family: var(--font-body); transition: border-color 0.2s; }
.comment-input:focus, .comment-textarea:focus { outline: none; border-color: var(--accent-color); }
.comment-submit { padding: 0.8rem 2rem; background: var(--accent-gradient); border: none; border-radius: 8px; color: var(--bg); font-weight: 600; cursor: pointer; transition: transform 0.2s; font-family: var(--font-body); text-transform: uppercase; }
.comment-submit:hover:not(:disabled) { transform: translateY(-2px); }
.comment-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.comment-list { display: flex; flex-direction: column; gap: 1.5rem; }
.comment-card { padding: 1.5rem; background: var(--bg-2); border-radius: 8px; border: 1px solid var(--card-border); }
.comment-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.comment-date { font-size: 0.85rem; color: var(--text-secondary); font-family: var(--font-body); }
.comment-text { line-height: 1.6; font-family: var(--font-body); }
.ai-reply { margin-top: 1.5rem; padding: 1.2rem; background: rgba(215, 193, 122, 0.05); border-left: 4px solid var(--accent-color); border-radius: 0 8px 8px 0; }
.ai-reply-header { font-weight: 700; color: var(--accent-color); margin-bottom: 0.5rem; font-family: var(--font-head); }
.ai-reply-text { line-height: 1.6; font-style: italic; color: var(--text-primary); font-family: var(--font-body); }

@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.hero-graphic { display: none; }

.mystical-divider {
  width: 100%;
  height: 1px;
  background: var(--card-border);
  margin: 4rem 0;
  position: relative;
}

.mystical-divider::after {
  content: url(\"data:image/svg+xml,%3Csvg width='40' height='20' viewBox='0 0 100 50' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 25 L30 10 L50 40 L70 15 L90 25' fill='none' stroke='%23d7c17a' stroke-width='2'/%3E%3Ccircle cx='10' cy='25' r='2' fill='%23d7c17a'/%3E%3Ccircle cx='30' cy='10' r='3' fill='%23d7c17a'/%3E%3Ccircle cx='50' cy='40' r='2' fill='%23d7c17a'/%3E%3Ccircle cx='70' cy='15' r='4' fill='%23d7c17a'/%3E%3Ccircle cx='90' cy='25' r='2' fill='%23d7c17a'/%3E%3C/svg%3E\");
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--bg);
  padding: 0 1rem;
}

.featured-title { font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--text-primary); font-family: var(--font-head); font-weight: 600; }
\"\"\"

with open('src/app/globals.css', 'w', encoding='utf-8') as f:
    f.write(css_content)

print('Done')
