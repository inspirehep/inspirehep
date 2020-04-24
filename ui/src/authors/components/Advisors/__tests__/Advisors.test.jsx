import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Advisors from '../Advisors';

describe('Advisors', () => {
  it('renders advisors', () => {
    const advisors = fromJS([
      {
        name: 'Degreeless Advisor',
      },
      {
        name: 'Other Advisor',
        degree_type: 'other',
      },
      {
        name: 'Master Advisor',
        degree_type: 'master',
      },
      {
        name: 'PhD Advisor',
        degree_type: 'phd',
      },
      {
        name: 'Another PhD Advisor',
        degree_type: 'phd',
      },
    ]);
    const wrapper = shallow(<Advisors advisors={advisors} />);
    expect(wrapper).toMatchSnapshot();
  });
});
