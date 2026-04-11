import React from 'react';
import { render, screen } from '@testing-library/react';
import CrowdHeatmap from '../src/components/CrowdHeatmap';

describe('CrowdHeatmap', () => {
    it('renders every section passed in', () => {
        const data = [
            { section: 'A1', density: 'LOW' as const },
            { section: 'B2', density: 'MEDIUM' as const },
        ];
        render(<CrowdHeatmap data={data} />);
        expect(screen.getByText('Sec A1')).toBeInTheDocument();
        expect(screen.getByText('Sec B2')).toBeInTheDocument();
    });

    it('annotates each cell with an accessible density label', () => {
        const data = [{ section: 'C3', density: 'HIGH' as const }];
        render(<CrowdHeatmap data={data} />);
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByLabelText(/Section C3.*High crowd/)).toBeInTheDocument();
    });

    it('shows an empty state when no data is provided', () => {
        render(<CrowdHeatmap data={[]} />);
        expect(screen.getByText(/No data available/)).toBeInTheDocument();
    });
});
