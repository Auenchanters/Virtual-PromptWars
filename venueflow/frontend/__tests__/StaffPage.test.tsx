import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StaffPage from '../src/pages/StaffPage';
import * as api from '../src/services/api';

jest.mock('../src/services/api');

describe('StaffPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the broadcast form with textarea and submit button', () => {
        render(<StaffPage />);
        expect(
            screen.getByRole('heading', { name: /Staff Operations Dashboard/i })
        ).toBeInTheDocument();
        expect(screen.getByLabelText(/Message to all attendees/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Broadcast Live/i })).toBeInTheDocument();
    });

    it('sends the announcement and shows a success alert', async () => {
        (api.broadcastStaffAlert as jest.Mock).mockResolvedValue(undefined);
        render(<StaffPage />);
        const textarea = screen.getByLabelText(/Message to all attendees/i);
        const submit = screen.getByRole('button', { name: /Broadcast Live/i });

        fireEvent.change(textarea, { target: { value: 'Gate 4 temporarily closed' } });
        fireEvent.click(submit);

        await waitFor(() => {
            expect(api.broadcastStaffAlert).toHaveBeenCalledWith('Gate 4 temporarily closed');
        });
        await waitFor(() => {
            expect(screen.getByText(/Broadcast sent successfully/i)).toBeInTheDocument();
        });
    });

    it('shows an accessible error alert when the API call fails', async () => {
        (api.broadcastStaffAlert as jest.Mock).mockRejectedValue(new Error('network'));
        render(<StaffPage />);
        fireEvent.change(screen.getByLabelText(/Message to all attendees/i), {
            target: { value: 'test' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Broadcast Live/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(/Failed to send broadcast/i);
        });
    });
});
