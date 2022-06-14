import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import JobItem from '../JobItem';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('JobItem', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders full job search result item', () => {
    const created = '2019-05-31T12:23:15.104851+00:00';
    const metadata = fromJS({
      deadline_date: '2020-05-31',
      position: 'Job Offer',
      arxiv_categories: ['hep-ex'],
      control_number: 12345,
      accelerator_experiments: [{ name: 'CERN-LHC-ATLAS' }],
      ranks: ['SENIOR'],
      regions: ['Europe'],
      institutions: [
        {
          value: 'CERN',
        },
      ],
    });
    const wrapper = shallow(<JobItem metadata={metadata} created={created} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
