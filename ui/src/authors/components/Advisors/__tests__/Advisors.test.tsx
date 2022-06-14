import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Advisors from '../Advisors';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Advisors', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2786) FIXME: 'Advisors' cannot be used as a JSX component.
    const wrapper = shallow(<Advisors advisors={advisors} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
