import React from 'react';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
import URLList from '../URLList';

describe('URLList', () => {
  it('renders with urls', () => {
    const urls = fromJS([
      {
        value: 'url1',
      },
      {
        value: 'url2',
      },
    ]);
    const { getByRole } = render(<URLList urls={urls} />);
    expect(getByRole('link', { name: 'url1' })).toHaveAttribute('href', 'url1');
    expect(getByRole('link', { name: 'url2' })).toHaveAttribute('href', 'url2');
  });
});
