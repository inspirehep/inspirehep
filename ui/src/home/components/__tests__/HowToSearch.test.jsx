import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../fixtures/render';
import HowToSearch from '../HowToSearch';

describe('HowToSearch', () => {
  it('renders with spires examples by default', () => {
    const { getByTestId, getByLabelText } = renderWithProviders(
      <HowToSearch />
    );
    const spiresRadioButton = getByLabelText('SPIRES');
    expect(spiresRadioButton).toBeChecked();
    expect(getByTestId('spires-examples')).toBeInTheDocument();
  });

  it('renders freetext examples after freetext radio option is selected', () => {
    const { getByTestId, getByText, getByLabelText } = renderWithProviders(
      <HowToSearch />
    );
    fireEvent.click(getByText('free text'));
    const freeTextRadioButton = getByLabelText('free text');
    expect(freeTextRadioButton).toBeChecked();
    expect(getByTestId('freetext-examples')).toBeInTheDocument();
  });
});
