import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';

// Mock the API service for health check
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      success: true,
      message: 'VerseSnap API is running',
      data: { timestamp: '2026-11-23T00:00:00.000Z' },
    }),
  },
}));

describe('RootLayout Component Smoke Test', () => {
  it('renders application branding and header', () => {
    render(
      <BrowserRouter>
        <RootLayout>
          <div>Test Content</div>
        </RootLayout>
      </BrowserRouter>
    );

    expect(screen.getByText('VerseSnap')).toBeDefined();
    expect(screen.getByText('Test Content')).toBeDefined();
    expect(screen.getByText(/v0.1.0-bootstrap/i)).toBeDefined();
  });
});
