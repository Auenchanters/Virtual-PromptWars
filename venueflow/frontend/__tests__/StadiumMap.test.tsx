import React from 'react';
import { render, screen } from '@testing-library/react';
import StadiumMap from '../src/components/StadiumMap';

jest.mock('@react-google-maps/api', () => ({
    useJsApiLoader: jest.fn(),
    GoogleMap: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="google-map">{children}</div>
    ),
    Marker: ({ title }: { title: string }) => <div data-testid="map-marker" title={title} />,
}));

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
});
