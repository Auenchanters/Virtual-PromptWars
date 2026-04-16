import React from 'react';
import { render, screen } from '@testing-library/react';

// Must be set before the component module is imported because StadiumMap.tsx
// reads import.meta.env.VITE_GOOGLE_MAPS_API_KEY at module evaluation time.
// The importMetaTransformer replaces import.meta.env.X → process.env.X.
process.env.VITE_GOOGLE_MAPS_API_KEY = 'test-key';

// Use React.createElement inside the factory because jest.mock is hoisted
// before the react/jsx-runtime import that the "react-jsx" transform relies on.
jest.mock('@react-google-maps/api', () => {
    const R = require('react');
    return {
        useJsApiLoader: jest.fn(),
        GoogleMap: ({ children }: { children?: React.ReactNode }) =>
            R.createElement('div', { 'data-testid': 'google-map' }, children),
        MarkerF: ({ title }: { title: string }) =>
            R.createElement('div', { 'data-testid': 'map-marker', title }),
    };
});

import StadiumMap from '../src/components/StadiumMap';

const { useJsApiLoader } = jest.requireMock('@react-google-maps/api');

describe('StadiumMap', () => {
    it('shows a loading placeholder while the script loads', () => {
        (useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: false, loadError: null });
        render(<StadiumMap crowd={[]} />);
        expect(screen.getByLabelText(/Loading stadium map/i)).toBeInTheDocument();
    });

    it('renders an alert when the Google Maps script fails to load', () => {
        (useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: false, loadError: new Error('x') });
        render(<StadiumMap crowd={[]} />);
        expect(screen.getByRole('alert')).toHaveTextContent(/map could not load/i);
    });

    it('renders a marker for every crowd section once loaded', () => {
        (useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: true, loadError: null });
        render(
            <StadiumMap
                crowd={[
                    { section: '101', density: 'HIGH' },
                    { section: '102', density: 'LOW' },
                ]}
            />
        );
        const markers = screen.getAllByTestId('map-marker');
        expect(markers).toHaveLength(2);
        expect(markers[0].getAttribute('title')).toMatch(/Section 101/);
    });

    it('renders a marker for an unknown section using fallback position', () => {
        (useJsApiLoader as jest.Mock).mockReturnValue({ isLoaded: true, loadError: null });
        render(
            <StadiumMap
                crowd={[{ section: '999', density: 'MEDIUM' }]}
            />
        );
        const markers = screen.getAllByTestId('map-marker');
        expect(markers).toHaveLength(1);
        expect(markers[0].getAttribute('title')).toMatch(/Section 999/);
    });
});
