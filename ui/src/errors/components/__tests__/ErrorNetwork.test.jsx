import React from 'react';

import { renderWithProviders } from '../../../fixtures/render';
import ErrorNetwork from '../ErrorNetwork';

describe('ErrorNetwork', () => {
  it('renders ErrorNetwork', () => {
    const { asFragment } = renderWithProviders(<ErrorNetwork />);
    expect(asFragment()).toMatchSnapshot();
  });
});
