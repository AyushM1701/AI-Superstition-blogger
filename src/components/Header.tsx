'use client';

import { useState } from 'react';
import OrionMark from './OrionMark';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: 'Daily Totka', href: '#daily' },
    { name: 'Superstition Archive', href: '#archive' },
    { name: 'Comment Discussion', href: '#comments' },
  ];

  return (
    <>
      <header className="hp-header">
        <div className="hp-header-top">
          <button 
            className="hp-hamburger" 
            onClick={toggleMobileMenu} 
            aria-label="Toggle Navigation Menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
          
          <div className="hp-logo-container">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="hp-logo-link">
              <OrionMark width={24} height={34} strokeOpacity={0.8} />
              <span className="hp-logo-text">TONA TOTKA</span>
            </a>
          </div>

          <div style={{ width: '40px' }} aria-hidden="true" />
        </div>

        <nav className="hp-header-bottom">
          <ul className="hp-nav-list">
            {navLinks.map((link) => (
              <li key={link.name} className="hp-nav-item">
                <a href={link.href} className="hp-nav-link">
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`hp-mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="hp-mobile-drawer-header">
          <span className="hp-mobile-title">MENU</span>
          <button className="hp-mobile-close" onClick={toggleMobileMenu} aria-label="Close Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <ul className="hp-mobile-nav-list">
          {navLinks.map((link) => (
            <li key={link.name} className="hp-mobile-nav-item">
              <a href={link.href} className="hp-mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      {mobileMenuOpen && <div className="hp-mobile-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </>
  );
}
