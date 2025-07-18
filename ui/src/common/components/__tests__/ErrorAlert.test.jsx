import React from 'react';

import { renderWithProviders } from '../../../fixtures/render';
import ErrorAlert from '../ErrorAlert';

describe('ErrorAlert', () => {
  it('renders with custom message', () => {
    const { getByText } = renderWithProviders(
      <ErrorAlert message="Terrible thing is happening!" />
    );
    expect(getByText('Terrible thing is happening!')).toBeInTheDocument();
  });

  it('renders with default message', () => {
    const { getByText } = renderWithProviders(<ErrorAlert />);
    expect(getByText('Something went wrong')).toBeInTheDocument();
  });
});
