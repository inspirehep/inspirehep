import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import IsbnList from '../IsbnList';

describe('IsbnList', () => {
  it('renders isbns with medium and without medium', () => {
    const isbns = fromJS([
      {
        value: '9781139632478',
        medium: 'print',
      },
      {
        value: '1231139632475',
      },
    ]);
    const { asFragment } = render(<IsbnList isbns={isbns} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
