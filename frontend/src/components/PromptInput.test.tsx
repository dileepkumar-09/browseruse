import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PromptInput } from './PromptInput';
import React from 'react';

describe('PromptInput', () => {
    it('renders the text area and submit button', () => {
        render(<PromptInput onSubmit={() => {}} isLoading={false} />);
        expect(screen.getByPlaceholderText(/Enter the task you want/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Start Task/i })).toBeInTheDocument();
    });

    it('typing in the input updates the state', () => {
        render(<PromptInput onSubmit={() => {}} isLoading={false} />);
        const input = screen.getByPlaceholderText(/Enter the task you want/i);
        fireEvent.change(input, { target: { value: 'New browser task' } });
        expect(input).toHaveValue('New browser task');
    });

    it('submit button triggers the API call', () => {
        const handleSubmit = vi.fn();
        render(<PromptInput onSubmit={handleSubmit} isLoading={false} />);
        
        const input = screen.getByPlaceholderText(/Enter the task you want/i);
        fireEvent.change(input, { target: { value: 'Navigate to website' } });
        
        const button = screen.getByRole('button', { name: /Start Task/i });
        fireEvent.click(button);
        
        expect(handleSubmit).toHaveBeenCalledWith('Navigate to website');
    });
});
