import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import AuthorName from '../AuthorName';

describe('AuthorName', () => {
  it('renders with preferred_name', () => {
    const name = fromJS({ preferred_name: 'Harun Urhan' });
    const { asFragment } = render(<AuthorName name={name} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with native_name', () => {
    const name = fromJS({
      preferred_name: 'Harun Urhan',
      native_names: ['赵新丽'],
    });
    const { asFragment } = render(<AuthorName name={name} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with formatted value if preffered_name is not present and value is comma separated', () => {
    const name = fromJS({ value: 'Urhan, Harun' });
    const { asFragment } = render(<AuthorName name={name} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with value if preffered_name is not present and value is not comma separated', () => {
    const name = fromJS({ value: 'Urhan Harun' });
    const { asFragment } = render(<AuthorName name={name} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
