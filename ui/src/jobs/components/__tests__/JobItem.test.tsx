import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import JobItem from '../JobItem';

describe('JobItem', () => {
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
    expect(wrapper).toMatchSnapshot();
  });
});
