import React from 'react';
import { shallow } from 'enzyme';

import JournalSuggestion from '../JournalSuggestion';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('JournalSuggestion', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with full journal', () => {
    const journal = {
      short_title: 'CJRL',
      journal_title: {
        title: 'Cool Journal of Tests',
      },
    };
    const wrapper = shallow(<JournalSuggestion journal={journal} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only short_title', () => {
    const journal = {
      short_title: 'CJRL',
    };
    const wrapper = shallow(<JournalSuggestion journal={journal} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
