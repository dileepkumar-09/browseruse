import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ResultViewer } from './ResultViewer';
import React from 'react';

describe('ResultViewer', () => {
    it('returns null if result and error are both null', () => {
        const { container } = render(<ResultViewer result={null} error={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('displays the final result when received', () => {
        render(<ResultViewer result="This is the final output." error={null} />);
        expect(screen.getByText(/This is the final output\./)).toBeInTheDocument();
    });

    it('displays an error message when error is set', () => {
        render(<ResultViewer result={null} error="Something went wrong" />);
        expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
        expect(screen.getByText(/Task Failed/)).toBeInTheDocument();
    });
});
