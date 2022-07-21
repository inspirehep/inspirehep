import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import { JournalItem } from '../JournalItem';

describe('JournalItem', () => {
  it('renders with props', () => {
    const result = fromJS({
      metadata: fromJS({
        short_title: 'West Virginia U.',
        publisher: ['Liverpool'],
        urls: [{ value: 'http://url.com' }],
        control_number: 1234,
        journal_title: {title: 'Department of Physics'},
      })
    });

    const wrapper = shallow(<JournalItem result={result} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with some props undefined', () => {
    const result = fromJS({
      metadata: fromJS({
        short_title: 'West Virginia U.',
        control_number: 1234,
        journal_title: 'Department of Physics',
      })
    });

    const wrapper = shallow(<JournalItem result={result} />);
    expect(wrapper).toMatchSnapshot();
  });
});
