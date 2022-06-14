import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import Institution from '../Institution';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('Institution', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders if institution has name', () => {
    const institution = fromJS({
      name: 'CERN',
    });
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Institution institution={institution} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders empty if instution does not has name', () => {
    const institution = fromJS({});
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<Institution institution={institution} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
