import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../src/components/Navbar';

describe('Navbar', () => {
    it('renders the brand and all primary nav links', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        expect(screen.getByLabelText(/VenueFlow home/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Staff' })).toBeInTheDocument();
    });

    it('exposes a labeled navigation landmark', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        expect(
            screen.getByRole('navigation', { name: /Primary navigation/i })
        ).toBeInTheDocument();
    });
});
