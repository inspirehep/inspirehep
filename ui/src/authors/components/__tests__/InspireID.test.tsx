import React from 'react';
import { render, screen } from '@testing-library/react';

import InspireID from '../InspireID';

describe('InspireID', () => {
  it('renders', () => {
    render(<InspireID id="INSPIRE-1234" />);
    expect(screen.getByText('INSPIRE ID: INSPIRE-1234')).toBeInTheDocument();
  });
});
