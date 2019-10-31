import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import JournalInfo from '../JournalInfo';

describe('JournalInfo', () => {
  it('renders with only journal_title', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
    });
    const wrapper = shallow(<JournalInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with journal_title and all other fields', () => {
    const info = fromJS({
      journal_title: 'Test Journal',
      journal_volume: 'TV',
      journal_issue: '2',
      year: '2015',
    });
    const wrapper = shallow(<JournalInfo info={info} />);
    expect(wrapper).toMatchSnapshot();
  });
});
