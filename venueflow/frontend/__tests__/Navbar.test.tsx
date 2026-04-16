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

    it('applies active class to the Dashboard link when on /dashboard', () => {
        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <Navbar />
            </MemoryRouter>
        );
        const dashLink = screen.getByRole('link', { name: 'Dashboard' });
        expect(dashLink.className).toContain('font-bold');
        expect(dashLink.className).toContain('underline');

        const homeLink = screen.getByRole('link', { name: 'Home' });
        expect(homeLink.className).not.toContain('font-bold');
    });

    it('applies active class to Home link when on /', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Navbar />
            </MemoryRouter>
        );
        const homeLink = screen.getByRole('link', { name: 'Home' });
        expect(homeLink.className).toContain('font-bold');
    });
});
