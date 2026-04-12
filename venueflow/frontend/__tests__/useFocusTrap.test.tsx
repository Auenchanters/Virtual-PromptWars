import React, { useRef } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useFocusTrap } from '../src/hooks/useFocusTrap';

function TrapContainer({ active, onEscape }: { active: boolean; onEscape: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    useFocusTrap(ref, active, onEscape);
    return (
        <div ref={ref} data-testid="trap">
            <button data-testid="first">First</button>
            <button data-testid="last">Last</button>
        </div>
    );
}

describe('useFocusTrap', () => {
    it('calls onEscape when Escape key is pressed', () => {
        const onEscape = jest.fn();
        const { getByTestId } = render(<TrapContainer active={true} onEscape={onEscape} />);
        fireEvent.keyDown(getByTestId('trap'), { key: 'Escape' });
        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('wraps focus from last to first on Tab', () => {
        const { getByTestId } = render(<TrapContainer active={true} onEscape={jest.fn()} />);
        const last = getByTestId('last');
        last.focus();
        fireEvent.keyDown(getByTestId('trap'), { key: 'Tab', shiftKey: false });
        // Focus should wrap — the event handler calls first.focus()
        expect(document.activeElement).toBe(getByTestId('first'));
    });

    it('wraps focus from first to last on Shift+Tab', () => {
        const { getByTestId } = render(<TrapContainer active={true} onEscape={jest.fn()} />);
        const first = getByTestId('first');
        first.focus();
        fireEvent.keyDown(getByTestId('trap'), { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(getByTestId('last'));
    });

    it('does not trap when inactive', () => {
        const onEscape = jest.fn();
        const { getByTestId } = render(<TrapContainer active={false} onEscape={onEscape} />);
        fireEvent.keyDown(getByTestId('trap'), { key: 'Escape' });
        expect(onEscape).not.toHaveBeenCalled();
    });
});
