import React from 'react';
import { render } from '@testing-library/react';

import { APIButton } from '../APIButton';

describe('APIButton', () => {
  it('renders APIButton', () => {
    const { getByRole } = render(
      <APIButton url="https://inspirebeta.net/authors/1306569" />
    );
    expect(getByRole('link')).toBeInTheDocument();
    expect(getByRole('link')).toHaveAttribute(
      'href',
      'https://inspirebeta.net/api/authors/1306569'
    );
  });
});
