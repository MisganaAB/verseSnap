import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function HealthPage() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setStatus('loading');
    setError(null);
    try {
      const response = await api.get('/health');
      setData(response);
      setStatus('success');
    } catch (err) {
      console.error('Health check failed:', err);
      setError(err);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ marginBottom: 'var(--space-2)' }}>System Health Status</h1>
        <p>Vertical slice verifying end-to-end communication between React frontend and Express backend.</p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                border: '2px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
              Checking backend connectivity...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                backgroundColor: 'var(--color-success-bg)',
                color: 'var(--color-success)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span>●</span>
              <span>All Systems Operational</span>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <strong style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Backend Message
              </strong>
              <p style={{ fontSize: '1.125rem', color: 'var(--color-text-primary)', marginTop: 'var(--space-1)' }}>
                {data?.message || 'VerseSnap API is running'}
              </p>
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <strong style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Server Timestamp
              </strong>
              <code
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: '0.875rem',
                  backgroundColor: 'var(--color-surface-hover)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: 'var(--space-1)',
                }}
              >
                {data?.data?.timestamp || data?.timestamp || 'N/A'}
              </code>
            </div>

            <button
              onClick={fetchHealth}
              style={{
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                padding: 'var(--space-2) var(--space-4)',
              }}
            >
              Re-check Status
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                backgroundColor: 'var(--color-error-bg)',
                color: 'var(--color-error)',
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              <span>▲</span>
              <span>Backend Connectivity Failure</span>
            </div>

            <p style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
              {error?.message || 'Failed to connect to backend server'} (Status: {error?.status || 'Unknown'})
            </p>

            <button
              onClick={fetchHealth}
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#ffffff',
                padding: 'var(--space-2) var(--space-4)',
              }}
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
