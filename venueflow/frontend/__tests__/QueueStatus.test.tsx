import React from 'react';
import { render, screen } from '@testing-library/react';
import QueueStatus from '../src/components/QueueStatus';

describe('QueueStatus', () => {
    it('renders wait times for every queue type', () => {
        const data = [
            { id: 'gate-1', type: 'gate', waitTimeMinutes: 10 },
            { id: 'concessions-1', type: 'concessions', waitTimeMinutes: 5 },
            { id: 'restroom-1', type: 'restroom', waitTimeMinutes: 2 },
        ];
        render(<QueueStatus queues={data} />);
        expect(screen.getByText('10 mins')).toBeInTheDocument();
        expect(screen.getByText('5 mins')).toBeInTheDocument();
        expect(screen.getByText('2 mins')).toBeInTheDocument();
        expect(screen.getByText('gate')).toBeInTheDocument();
        expect(screen.getByText('concessions')).toBeInTheDocument();
        expect(screen.getByText('restroom')).toBeInTheDocument();
    });

    it('shows a friendly empty state with no queue data', () => {
        render(<QueueStatus queues={[]} />);
        expect(screen.getByText(/No queue data available/i)).toBeInTheDocument();
    });
});
