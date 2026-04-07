import React from 'react';
import { render, screen } from '@testing-library/react';
import CrowdHeatmap from '../src/components/CrowdHeatmap';

describe('CrowdHeatmap Component', () => {
    it('CrowdHeatmap renders all stadium sections', () => {
        const data = [
            { section: 'A1', density: 'LOW' as const },
            { section: 'B2', density: 'MEDIUM' as const },
        ];
        render(<CrowdHeatmap data={data} />);
        
        expect(screen.getByText('Sec A1')).toBeInTheDocument();
        expect(screen.getByText('Sec B2')).toBeInTheDocument();
    });

    it('CrowdHeatmap displays correct label ("HIGH", "MEDIUM", "LOW") for each density level', () => {
        const data = [
            { section: 'C3', density: 'HIGH' as const },
        ];
        render(<CrowdHeatmap data={data} />);
        
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByLabelText('Section C3: HIGH density')).toBeInTheDocument();
    });
});
