import React from 'react';
import { render } from '@testing-library/react';

import DOILink from '../DOILink';

describe('DOILink', () => {
  it('renders with doi', () => {
    const { asFragment } = render(
      <DOILink doi="12.1234/1234567890123_1234">DOI</DOILink>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
