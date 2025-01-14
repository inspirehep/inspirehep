import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import DOIListShowAll from '../DOIListShowAll';

describe('DOIListShowAll', () => {
  it('renders correctly with default props', () => {
    const { asFragment } = render(<DOIListShowAll />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with data and other dois', () => {
    const dois = fromJS([
      { material: 'data', value: 'doi1' },
      { material: 'data', value: 'doi2' },
      { material: 'article', value: 'doi3' },
    ]);
    const { asFragment } = render(<DOIListShowAll dois={dois} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with dataDois only', () => {
    const dois = fromJS([
      { material: 'data', value: 'doi1' },
      { material: 'data', value: 'doi2' },
    ]);
    const { asFragment } = render(<DOIListShowAll dois={dois} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correctly with no dataDois', () => {
    const { asFragment } = render(<DOIListShowAll dois={fromJS([])} />);
    expect(asFragment()).toMatchSnapshot();
  });
});
