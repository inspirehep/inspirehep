import React from 'react';
import { render } from '@testing-library/react';
import GridLink from '../GridLink';

describe('GridLink', () => {
  it('renders', () => {
    const grid = 'grid123';
    const { asFragment } = render(<GridLink grid={grid} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
