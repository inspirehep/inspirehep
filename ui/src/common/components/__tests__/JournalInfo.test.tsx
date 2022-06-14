import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import JournalInfo from '../JournalInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('JournalInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only journal_title', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
    });
    const wrapper = shallow(<JournalInfo info={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with journal_title and all other fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      journal_issue: '2',
      year: '2015',
    });
    const wrapper = shallow(<JournalInfo info={info} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
