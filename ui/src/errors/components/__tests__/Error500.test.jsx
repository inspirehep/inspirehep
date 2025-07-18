import React from 'react';

import Error500 from '../Error500';
import { renderWithProviders } from '../../../fixtures/render';

describe('Error500', () => {
  it('renders Error500', () => {
    const { asFragment } = renderWithProviders(<Error500 />);
    expect(asFragment()).toMatchSnapshot();
  });
});
