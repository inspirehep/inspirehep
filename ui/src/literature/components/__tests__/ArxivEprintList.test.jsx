import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import ArxivEprintList from '../ArxivEprintList';

describe('ArxivEprintList', () => {
  it('renders with arXiv id', () => {
    const eprints = fromJS([
      {
        value: '123.12345',
      },
    ]);
    const { asFragment } = render(<ArxivEprintList eprints={eprints} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
