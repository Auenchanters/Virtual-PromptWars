import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../src/pages/HomePage';

jest.mock('../src/services/api');

describe('HomePage', () => {
    it('renders the welcome heading and itinerary planner', () => {
        render(<HomePage />);
        expect(screen.getByRole('heading', { name: /Welcome to VenueFlow/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Enter your seating section/i)).toBeInTheDocument();
    });
});
