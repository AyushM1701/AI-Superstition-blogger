import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container" style={{ textAlign: 'center', paddingTop: '10vh' }}>
      <h1 style={{ fontSize: '6rem', marginBottom: '0.5rem', opacity: 0.15 }}>404</h1>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
        The superstition you&apos;re looking for doesn&apos;t exist — or perhaps it vanished into thin air.
      </p>
      <Link href="/" style={{
        display: 'inline-block',
        background: 'var(--accent-gradient)',
        color: '#fff',
        padding: '0.75rem 2rem',
        borderRadius: '9999px',
        fontWeight: 600,
        transition: 'transform 0.2s ease'
      }}>
        ← Back to Home
      </Link>
    </main>
  );
}
