import React, { useRef, useEffect } from 'react';

interface StatusMessage {
  text: string;
  type: 'info' | 'error' | 'step';
}

interface Props {
  messages: StatusMessage[];
}

const typeColors: Record<string, string> = {
  info: '#555',
  error: '#d32f2f',
  step: '#1565c0',
};

export const TaskStatus: React.FC<Props> = ({ messages }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const stepCount = messages.filter(m => m.type === 'step').length;

  return (
    <div className="status-container" style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <h3 style={{ marginTop: 0 }}>
        Live Status Updates
        {stepCount > 0 && <span style={{ fontWeight: 'normal', fontSize: '14px', color: '#888', marginLeft: '10px' }}>({stepCount} steps)</span>}
      </h3>
      <div ref={scrollRef} style={{ maxHeight: '250px', minHeight: '50px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
        {messages.length === 0 ? (
          <p style={{ color: '#888', margin: 0 }}>No active task...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{ marginBottom: '4px', fontSize: '13px', fontFamily: 'monospace', color: typeColors[msg.type] || '#555' }}>
              &gt; {msg.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
