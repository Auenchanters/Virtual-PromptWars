import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
});
