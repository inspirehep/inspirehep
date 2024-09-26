import React from 'react';
import { render } from '@testing-library/react';

import { APIButton } from '../APIButton';

describe('APIButton', () => {
  it('renders APIButton', () => {
    const { asFragment } = render(
      <APIButton url="https://inspirebeta.net/authors/1306569" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
