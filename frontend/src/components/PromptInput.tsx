import React, { useState } from 'react';

interface Props {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export const PromptInput: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  return (
    <div className="prompt-container">
      <h2>Task Instructions</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter the task you want the browser agent to perform..."
          rows={4}
          disabled={isLoading}
          style={{ width: '100%', marginBottom: '10px', padding: '10px', boxSizing: 'border-box' }}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          {isLoading ? 'Running...' : 'Start Task'}
        </button>
      </form>
    </div>
  );
}
