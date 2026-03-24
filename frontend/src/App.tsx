import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PromptInput } from './components/PromptInput';
import { TaskStatus } from './components/TaskStatus';
import { ResultViewer } from './components/ResultViewer';
import './App.css';

function App() {
  const [statusMessages, setStatusMessages] = useState<{ text: string; type: 'info' | 'error' | 'step' }[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addStatus = useCallback((text: string, type: 'info' | 'error' | 'step' = 'info') => {
    setStatusMessages(prev => [...prev, { text, type }]);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (isLoading) {
        addStatus('⏰ No response from agent for 120 seconds — model may still be processing...', 'info');
      }
    }, 120000);
  }, [isLoading, addStatus]);

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        resetInactivityTimer();
        if (data.type === 'status') {
          const msgType = data.message.startsWith('❌') ? 'error'
            : data.message.startsWith('📍') ? 'step'
            : 'info';
          addStatus(data.message, msgType);
        } else if (data.type === 'result') {
          setResult(data.message);
          setIsLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        } else if (data.type === 'error') {
          setError(data.message);
          setIsLoading(false);
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected, reconnecting in 3s...');
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [addStatus, resetInactivityTimer]);

  useEffect(() => {
    connectWebSocket();

    fetch('http://localhost:8000/health')
      .then(r => r.json())
      .then(d => setBackendOk(d.ollama))
      .catch(() => setBackendOk(false));

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [connectWebSocket]);

  const handleRunTask = async (prompt: string) => {
    setIsLoading(true);
    setStatusMessages([]);
    setResult(null);
    setError(null);
    resetInactivityTimer();

    try {
      const response = await fetch('http://localhost:8000/run-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to start task');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      addStatus(`❌ ${message}`, 'error');
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="App" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Browser Automation AI Agent</h1>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <span style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: backendOk === null ? '#ccc' : backendOk ? '#4caf50' : '#f44336',
          marginRight: '8px'
        }} />
        <span style={{ fontSize: '14px', color: '#666' }}>
          {backendOk === null ? 'Checking backend...' : backendOk ? 'Backend & Ollama connected' : 'Backend or Ollama unreachable'}
        </span>
      </div>
      <PromptInput onSubmit={handleRunTask} isLoading={isLoading} />
      <TaskStatus messages={statusMessages} />
      <ResultViewer result={result} error={error} />
    </div>
  );
}

export default App;
