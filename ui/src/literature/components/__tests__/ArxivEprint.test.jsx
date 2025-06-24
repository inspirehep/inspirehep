import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import ArxivEprint from '../ArxivEprint';

describe('ArxivEprint', () => {
  it('renders with arXiv id', () => {
    const eprint = fromJS({
      value: '123.12345',
      categories: ['cat'],
    });
    const { asFragment } = render(<ArxivEprint eprint={eprint} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
