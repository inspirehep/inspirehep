import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';

import BookSeriesInfoList from '../BookSeriesInfoList';

describe('BookSeriesInfoList', () => {
  it('renders many book series info', () => {
    const bookSeries = fromJS([
      {
        title: 'A title of book',
        volume: '1',
      },
      {
        title: 'Another title of book',
        volume: '2',
      },
    ]);
    const { asFragment } = render(
      <BookSeriesInfoList bookSeries={bookSeries} />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders one book series info', () => {
    const bookSeries = fromJS([
      {
        title: 'A title of book',
        volume: '1',
      },
    ]);
    const { asFragment } = render(
      <BookSeriesInfoList bookSeries={bookSeries} />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
