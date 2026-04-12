import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { useCrowdData } from '../src/hooks/useCrowdData';
import * as api from '../src/services/api';

jest.mock('../src/services/api');

function Probe({ onState }: { onState: (state: ReturnType<typeof useCrowdData>) => void }) {
    const state = useCrowdData();
    React.useEffect(() => { onState(state); }, [state, onState]);
    return null;
}

describe('useCrowdData', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        (api.fetchCrowdData as jest.Mock).mockResolvedValue([
            { section: '101', density: 'HIGH' },
        ]);
        (api.fetchQueueData as jest.Mock).mockResolvedValue([
            { id: 'gate-1', type: 'gate', waitTimeMinutes: 10 },
        ]);
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('fetches crowd and queue data on mount and clears loading when complete', async () => {
        const states: ReturnType<typeof useCrowdData>[] = [];
        render(<Probe onState={(s) => states.push(s)} />);

        await waitFor(() => {
            expect(api.fetchCrowdData).toHaveBeenCalled();
            expect(api.fetchQueueData).toHaveBeenCalled();
        });

        await waitFor(() => {
            const final = states[states.length - 1];
            expect(final.loading).toBe(false);
            expect(final.crowd).toHaveLength(1);
            expect(final.queues).toHaveLength(1);
        });
    });

    it('clears the interval on unmount so no further fetches fire', async () => {
        const { unmount } = render(<Probe onState={() => {}} />);
        await waitFor(() => expect(api.fetchCrowdData).toHaveBeenCalledTimes(1));
        unmount();
        act(() => {
            jest.advanceTimersByTime(60_000);
        });
        expect(api.fetchCrowdData).toHaveBeenCalledTimes(1);
    });
});
