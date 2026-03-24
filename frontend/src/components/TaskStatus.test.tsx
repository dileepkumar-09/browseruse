import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TaskStatus } from './TaskStatus';
import React from 'react';

describe('TaskStatus', () => {
    it('shows no active task when messages are empty', () => {
        render(<TaskStatus messages={[]} />);
        expect(screen.getByText(/No active task.../i)).toBeInTheDocument();
    });

    it('renders status messages correctly', () => {
        const msgs = [
            { text: 'Initializing agent', type: 'info' as const },
            { text: 'Opening browser', type: 'step' as const },
            { text: 'Something failed', type: 'error' as const },
        ];
        render(<TaskStatus messages={msgs} />);
        expect(screen.getByText(/> Initializing agent/)).toBeInTheDocument();
        expect(screen.getByText(/> Opening browser/)).toBeInTheDocument();
        expect(screen.getByText(/> Something failed/)).toBeInTheDocument();
    });
});
