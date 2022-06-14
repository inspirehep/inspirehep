import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ConferenceItem from '../ConferenceItem';

describe('ConferenceItem', () => {
  it('renders with all props set', () => {
    const metadata = fromJS({
      titles: [{ title: 'test' }],
      acronyms: ['acronym'],
      opening_date: '2019-11-21',
      closing_date: '2019-11-28',
      control_number: 12345,
      addresses: [
        {
          cities: ['Liverpool'],
          country_code: 'USA',
          country: 'country',
        },
      ],
      cnum: 'C05-09-16.1',
      can_edit: true,
      inspire_categories: [{ term: 'physics' }],
      urls: [{ value: 'http://url.com' }],
      proceedings: [
        {
          publication_info: [
            {
              year: 2015,
              journal_title: 'title',
            },
          ],
        },
      ],
      number_of_contributions: 3,
    });

    const wrapper = shallow(
      <ConferenceItem metadata={metadata} openDetailInNewTab />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only needed props', () => {
    const metadata = fromJS({
      titles: [{ title: 'test' }],
      control_number: 12345,
      opening_date: '2019-11-21',
    });

    const wrapper = shallow(<ConferenceItem metadata={metadata} />);
    expect(wrapper).toMatchSnapshot();
  });
});
