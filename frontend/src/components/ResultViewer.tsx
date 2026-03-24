import React from 'react';

interface Props {
  result: string | null;
  error?: string | null;
}

export const ResultViewer: React.FC<Props> = ({ result, error }) => {
  if (!result && !error) return null;

  if (error) {
    return (
      <div className="result-container" style={{ marginTop: '20px', padding: '15px', border: '1px solid #d32f2f', borderRadius: '5px', backgroundColor: '#ffebee' }}>
        <h3 style={{ color: '#c62828', marginTop: 0 }}>❌ Task Failed</h3>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#b71c1c' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="result-container" style={{ marginTop: '20px', padding: '15px', border: '1px solid #4caf50', borderRadius: '5px', backgroundColor: '#e8f5e9' }}>
      <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✅ Final Result</h3>
      <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{result}</p>
    </div>
  );
}
