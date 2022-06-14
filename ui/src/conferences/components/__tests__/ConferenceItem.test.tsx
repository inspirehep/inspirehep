import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import ConferenceItem from '../ConferenceItem';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ConferenceItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <ConferenceItem metadata={metadata} openDetailInNewTab />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with only needed props', () => {
    const metadata = fromJS({
      titles: [{ title: 'test' }],
      control_number: 12345,
      opening_date: '2019-11-21',
    });

    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<ConferenceItem metadata={metadata} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
