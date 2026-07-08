export default function Loading() {
  return (
    <main className="container">
      <header className="header">
        <div className="skeleton-title" />
        <div className="skeleton-subtitle" />
      </header>
      <div className="video-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="video-card skeleton-card">
            <div className="thumbnail-image skeleton-pulse" style={{ background: 'var(--card-bg)' }} />
            <div className="card-content">
              <div className="skeleton-line" style={{ width: '80%', height: '1.2rem' }} />
              <div className="skeleton-line" style={{ width: '50%', height: '0.8rem', marginTop: '0.75rem' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
