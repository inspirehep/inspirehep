import React from 'react';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(<BookSeriesInfoList bookSeries={bookSeries} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders one book series info', () => {
    const bookSeries = fromJS([
      {
        title: 'A title of book',
        volume: '1',
      },
    ]);
    const wrapper = shallow(<BookSeriesInfoList bookSeries={bookSeries} />);
    expect(wrapper).toMatchSnapshot();
  });
});
