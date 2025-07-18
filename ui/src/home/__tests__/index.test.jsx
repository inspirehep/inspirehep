import React from 'react';

import Home from '..';
import { renderWithProviders } from '../../fixtures/render';

describe('Home', () => {
  it('renders home page', () => {
    const { asFragment } = renderWithProviders(<Home />);
    expect(asFragment()).toMatchSnapshot();
  });
});
