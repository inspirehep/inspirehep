import React from 'react';
import { fireEvent } from '@testing-library/react';
import { renderWithRouter } from '../../../fixtures/render';
import HowToSearch from '../HowToSearch';

describe('HowToSearch', () => {
  it('renders with spires examples by default', () => {
    const { getByTestId, getByLabelText } = renderWithRouter(<HowToSearch />);
    const spiresRadioButton = getByLabelText('SPIRES');
    expect(spiresRadioButton).toBeChecked();
    expect(getByTestId('spires-examples')).toBeInTheDocument();
  });

  it('renders freetext examples after freetext radio option is selected', () => {
    const { getByTestId, getByText, getByLabelText } = renderWithRouter(
      <HowToSearch />
    );
    fireEvent.click(getByText('free text'));
    const freeTextRadioButton = getByLabelText('free text');
    expect(freeTextRadioButton).toBeChecked();
    expect(getByTestId('freetext-examples')).toBeInTheDocument();
  });
});
