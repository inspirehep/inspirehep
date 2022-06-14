import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import InstitutionsList from '../InstitutionsList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('InstitutionsList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders institutions', () => {
    const institutions = fromJS([
      {
        value: 'UC, Berkeley',
      },
      {
        value: 'CERN',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<InstitutionsList institutions={institutions} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
