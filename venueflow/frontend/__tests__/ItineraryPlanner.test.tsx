import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ItineraryPlanner from '../src/components/ItineraryPlanner';
import * as api from '../src/services/api';

jest.mock('../src/services/api');

describe('ItineraryPlanner Component', () => {
    it('ItineraryPlanner renders section input form', () => {
        render(<ItineraryPlanner />);
        expect(screen.getByLabelText(/Enter your seating section/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Generate Planner/i })).toBeInTheDocument();
    });

    it('ItineraryPlanner shows generated itinerary after form submission', async () => {
        (api.getItinerary as jest.Mock).mockResolvedValue('Go to section 112 via gate 3.');

        render(<ItineraryPlanner />);
        const input = screen.getByPlaceholderText(/112/i);
        const button = screen.getByRole('button', { name: /Generate Planner/i });

        fireEvent.change(input, { target: { value: '112' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText('Go to section 112 via gate 3.')).toBeInTheDocument();
        });
    });

    it('does not break when unmounted during an inflight request', async () => {
        let resolveItinerary!: (value: string) => void;
        (api.getItinerary as jest.Mock).mockImplementation(
            () => new Promise<string>((resolve) => { resolveItinerary = resolve; })
        );

        const { unmount } = render(<ItineraryPlanner />);
        const input = screen.getByPlaceholderText(/112/i);
        const button = screen.getByRole('button', { name: /Generate Planner/i });

        fireEvent.change(input, { target: { value: '200' } });
        fireEvent.click(button);

        // Unmount while request is still pending
        unmount();

        // Resolve after unmount — should not throw or warn about state updates
        await act(async () => {
            resolveItinerary('Late response');
        });
    });
});
