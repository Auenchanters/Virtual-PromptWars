import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { useGemini, useDebounce } from '../src/hooks/useGemini';
import * as api from '../src/services/api';

jest.mock('../src/services/api');

function GeminiProbe({ onState }: { onState: (state: ReturnType<typeof useGemini>) => void }) {
    const state = useGemini();
    React.useEffect(() => { onState(state); }, [state, onState]);
    return null;
}

function DebounceProbe({ value, delay, onValue }: { value: string; delay: number; onValue: (v: string) => void }) {
    const debounced = useDebounce(value, delay);
    React.useEffect(() => { onValue(debounced); }, [debounced, onValue]);
    return null;
}

describe('useGemini', () => {
    afterEach(() => jest.clearAllMocks());

    it('sendMessage returns reply on success', async () => {
        (api.chatGemini as jest.Mock).mockResolvedValue('Bot reply');
        let latestState: ReturnType<typeof useGemini> | null = null;
        render(<GeminiProbe onState={(s) => { latestState = s; }} />);

        let result: string | null = null;
        await act(async () => {
            result = await latestState!.sendMessage('Hello');
        });

        expect(result).toBe('Bot reply');
    });

    it('sendMessage sets error on failure', async () => {
        (api.chatGemini as jest.Mock).mockRejectedValue(new Error('fail'));
        let latestState: ReturnType<typeof useGemini> | null = null;
        render(<GeminiProbe onState={(s) => { latestState = s; }} />);

        let result: string | null = null;
        await act(async () => {
            result = await latestState!.sendMessage('Hello');
        });

        expect(result).toBeNull();
        await waitFor(() => {
            expect(latestState!.error).toBe('Failed to fetch response');
        });
    });
});

describe('useDebounce', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('returns the initial value immediately and debounced value after delay', async () => {
        const values: string[] = [];
        const { rerender } = render(
            <DebounceProbe value="first" delay={300} onValue={(v) => values.push(v)} />
        );

        expect(values[values.length - 1]).toBe('first');

        rerender(
            <DebounceProbe value="second" delay={300} onValue={(v) => values.push(v)} />
        );

        act(() => { jest.advanceTimersByTime(300); });

        await waitFor(() => {
            expect(values[values.length - 1]).toBe('second');
        });
    });
});
