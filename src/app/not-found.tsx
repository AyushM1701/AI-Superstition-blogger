import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container" style={{ textAlign: 'center', paddingTop: '10vh' }}>
      <svg
        className="delay-draw"
        width="120"
        height="120"
        viewBox="0 0 100 100"
        style={{ margin: '0 auto 2rem', opacity: 0.15, display: 'block' }}
        aria-hidden="true"
      >
        <path className="constellation-path constellation-path--404" d="M20 50 L40 20 L60 80 L80 50 L90 30" fill="none" stroke="var(--accent)" strokeWidth="1.5" />
        <circle className="constellation-star constellation-star-1" cx="20" cy="50" r="1.5" fill="var(--accent)" />
        <circle className="constellation-star constellation-star-2" cx="40" cy="20" r="1.5" fill="var(--accent)" />
        <circle className="constellation-star constellation-star-large" cx="60" cy="80" r="3" fill="var(--accent)" />
        <circle className="constellation-star constellation-star-3" cx="80" cy="50" r="2" fill="var(--accent)" />
        <circle className="constellation-star constellation-star-4" cx="90" cy="30" r="1.5" fill="var(--accent)" />
      </svg>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>Star Missing</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem', fontFamily: 'var(--font-head)' }}>
        The constellation you&apos;re looking for has shifted out of view — or perhaps it vanished into the deep night.
      </p>
      <Link href="/" className="back-to-chart-btn">
        ← Back to Chart
      </Link>
    </main>
  );
}
