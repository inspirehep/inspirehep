import React from 'react';
import { shallow } from 'enzyme';

import JournalSuggestion from '../JournalSuggestion';

describe('JournalSuggestion', () => {
  it('renders with full journal', () => {
    const journal = {
      short_title: 'CJRL',
      journal_title: {
        title: 'Cool Journal of Tests',
      },
    };
    const wrapper = shallow(<JournalSuggestion journal={journal} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only short_title', () => {
    const journal = {
      short_title: 'CJRL',
    };
    const wrapper = shallow(<JournalSuggestion journal={journal} />);
    expect(wrapper).toMatchSnapshot();
  });
});
