import React from 'react';

import { render, screen } from '@testing-library/react';
import NumberOfResults from '../NumberOfResults';

describe('NumberOfResults', () => {
  it('renders with plural suffix if it is more than 1', () => {
    render(<NumberOfResults numberOfResults={27276} />);
    expect(screen.getByText(/results/i)).toBeInTheDocument();
  });

  it('renders with plural suffix if it is 0', () => {
    render(<NumberOfResults numberOfResults={0} />);
    expect(screen.getByText(/results/i)).toBeInTheDocument();
  });

  it('renders with singular suffix if it is 1', () => {
    render(<NumberOfResults numberOfResults={1} />);
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });
});
