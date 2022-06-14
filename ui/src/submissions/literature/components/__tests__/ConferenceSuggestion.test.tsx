import React from 'react';
import { shallow } from 'enzyme';

import ConferenceSuggestion from '../ConferenceSuggestion';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ConferenceSuggestion', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with full conference', () => {
    const conference = {
      cnum: '12345',
      acronyms: ['The Acronym 1', 'The Acronym 2'],
      address: [{ country_code: 'TR', cities: ['Istanbul'] }],
      titles: [
        {
          title: 'The Conference',
        },
      ],
      opening_date: '1 May 1999',
    };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ConferenceSuggestion conference={conference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only title', () => {
    const conference = {
      titles: [
        {
          title: 'The Conference',
        },
      ],
    };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ConferenceSuggestion conference={conference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with title and address but without city', () => {
    const conference = {
      titles: [
        {
          title: 'The Conference',
        },
      ],
      address: [{ country_code: 'TR' }],
    };
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ConferenceSuggestion conference={conference} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
