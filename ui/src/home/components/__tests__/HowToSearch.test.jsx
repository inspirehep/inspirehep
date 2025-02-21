import React from 'react';

import { fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HowToSearch from '../HowToSearch';

describe('HowToSearch', () => {
  it('renders with spires examples by default', () => {
    const { getByTestId, getByLabelText } = render(
      <MemoryRouter>
        <HowToSearch />
      </MemoryRouter>
    );
    const spiresRadioButton = getByLabelText('SPIRES');
    expect(spiresRadioButton).toBeChecked();
    expect(getByTestId('spires-examples')).toBeInTheDocument();
  });

  it('renders freetext examples after freetext radio option is selected', () => {
    const { getByTestId, getByText, getByLabelText } = render(
      <MemoryRouter>
        <HowToSearch />
      </MemoryRouter>
    );
    fireEvent.click(getByText('free text'));
    const freeTextRadioButton = getByLabelText('free text');
    expect(freeTextRadioButton).toBeChecked();
    expect(getByTestId('freetext-examples')).toBeInTheDocument();
  });
});
