import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../src/components/Navbar';
import CrowdHeatmap from '../src/components/CrowdHeatmap';
import QueueStatus from '../src/components/QueueStatus';
import GeminiChatbot from '../src/components/GeminiChatbot';
import ItineraryPlanner from '../src/components/ItineraryPlanner';
import * as hooks from '../src/hooks/useGemini';
import * as api from '../src/services/api';

jest.mock('../src/hooks/useGemini');
jest.mock('../src/services/api');

describe('Accessibility landmarks and semantics', () => {
    it('Navbar exposes a labeled navigation landmark with list semantics', () => {
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );
        expect(screen.getByRole('navigation', { name: /Primary navigation/i })).toBeInTheDocument();
        expect(screen.getAllByRole('listitem').length).toBe(3);
    });

    it('CrowdHeatmap marks each cell with an aria-label that describes both section and density', () => {
        render(
            <CrowdHeatmap
                data={[
                    { section: '101', density: 'HIGH' },
                    { section: '102', density: 'LOW' },
                ]}
            />
        );
        expect(screen.getByLabelText(/Section 101.*High crowd/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Section 102.*Low crowd/)).toBeInTheDocument();
        expect(screen.getByRole('grid', { name: /Stadium crowd density map/i })).toBeInTheDocument();
    });

    it('QueueStatus uses a labeled region heading', () => {
        render(<QueueStatus queues={[{ id: 'g1', type: 'gate', waitTimeMinutes: 5 }]} />);
        expect(screen.getByRole('heading', { name: /Live Wait Times/i })).toBeInTheDocument();
    });

    it('GeminiChatbot dialog is modal and labeled; Escape closes it', () => {
        (hooks.useGemini as jest.Mock).mockReturnValue({ sendMessage: jest.fn(), loading: false });
        render(<GeminiChatbot />);
        fireEvent.click(screen.getByLabelText('Open Venue Assistant Chat'));
        const dialog = screen.getByRole('dialog', { name: /Venue Assistant/i });
        expect(dialog).toHaveAttribute('aria-modal', 'true');

        fireEvent.keyDown(dialog, { key: 'Escape' });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('ItineraryPlanner reports an accessible error when the section is empty', () => {
        render(<ItineraryPlanner />);
        const submit = screen.getByRole('button', { name: /Generate Planner/i });
        fireEvent.click(submit);
        const error = screen.getByRole('alert');
        expect(error).toHaveTextContent(/seating section/i);
    });

    it('ItineraryPlanner associates error message with input via aria-describedby', async () => {
        (api.getItinerary as jest.Mock).mockResolvedValue('ok');
        render(<ItineraryPlanner />);
        const input = screen.getByLabelText(/Enter your seating section/i);
        fireEvent.click(screen.getByRole('button', { name: /Generate Planner/i }));
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(input).toHaveAttribute('aria-describedby', 'section-error');
    });
});
