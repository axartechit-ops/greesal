'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#FAF6F0', fontFamily: 'sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', border: '1px solid #EBE3D5' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#123B2B', marginBottom: '8px' }}>Greesal Application Error</h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
              {error?.message || 'A temporary error occurred.'}
            </p>
            <button
              onClick={() => reset()}
              style={{ padding: '10px 20px', borderRadius: '12px', backgroundColor: '#123B2B', color: '#ffffff', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
