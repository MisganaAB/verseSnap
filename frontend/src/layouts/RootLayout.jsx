import React from 'react';
import { Outlet } from 'react-router-dom';

export default function RootLayout({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-4) 0',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>📖</span>
            <span
              style={{
                fontFamily: 'var(--font-family-serif)',
                fontSize: '1.375rem',
                fontWeight: 600,
                color: 'var(--color-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              VerseSnap
            </span>
          </div>
          <span
            style={{
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '2px 8px',
            }}
          >
            v0.1.0-bootstrap
          </span>
        </div>
      </header>

      {/* Main Content Outlet / Children */}
      <main style={{ flex: 1, padding: 'var(--space-8) 0' }}>
        <div className="container">
          {children || <Outlet />}
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          padding: 'var(--space-6) 0',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p style={{ margin: 0 }}>
            VerseSnap &copy; {new Date().getFullYear()} &mdash; One product, two front doors.
          </p>
        </div>
      </footer>
    </div>
  );
}
