import React from 'react';
import { render } from '@testing-library/react';

import ArxivEprintLink from '../ArxivEprintLink';

describe('ArxivEprintLink', () => {
  it('renders with arXiv id', () => {
    const { asFragment } = render(
      <ArxivEprintLink>123.123456</ArxivEprintLink>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
