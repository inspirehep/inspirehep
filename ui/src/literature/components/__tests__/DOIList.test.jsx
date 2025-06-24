import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import DOIList from '../DOIList';

describe('DOIList', () => {
  it('renders with dois', () => {
    const dois = fromJS([
      { value: '12.1234/1234567890123_1234' },
      {
        value: '99.9999/9999999999999_9999',
        material: 'erratum',
      },
    ]);
    const { asFragment } = render(<DOIList dois={dois} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with dois and showLabel as true', () => {
    const dois = fromJS([
      { value: '12.1234/1234567890123_1234' },
      {
        value: '99.9999/9999999999999_9999',
        material: 'erratum',
      },
    ]);
    const { asFragment } = render(<DOIList dois={dois} showLabel />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with dois and showLabel as false', () => {
    const dois = fromJS([
      { value: '12.1234/1234567890123_1234' },
      {
        value: '99.9999/9999999999999_9999',
        material: 'erratum',
      },
    ]);
    const { asFragment } = render(<DOIList dois={dois} showLabel={false} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
