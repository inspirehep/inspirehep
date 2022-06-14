import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import BookSeriesInfoList from '../BookSeriesInfoList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('BookSeriesInfoList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders one book series info', () => {
    const bookSeries = fromJS([
      {
        title: 'A title of book',
        volume: '1',
      },
    ]);
    const wrapper = shallow(<BookSeriesInfoList bookSeries={bookSeries} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
