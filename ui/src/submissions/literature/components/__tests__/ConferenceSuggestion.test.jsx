import React from 'react';
import { shallow } from 'enzyme';

import ConferenceSuggestion from '../ConferenceSuggestion';

describe('ConferenceSuggestion', () => {
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
    const wrapper = shallow(<ConferenceSuggestion conference={conference} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only title', () => {
    const conference = {
      titles: [
        {
          title: 'The Conference',
        },
      ],
    };
    const wrapper = shallow(<ConferenceSuggestion conference={conference} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with title and address but without city', () => {
    const conference = {
      titles: [
        {
          title: 'The Conference',
        },
      ],
      address: [{ country_code: 'TR' }],
    };
    const wrapper = shallow(<ConferenceSuggestion conference={conference} />);
    expect(wrapper).toMatchSnapshot();
  });
});
