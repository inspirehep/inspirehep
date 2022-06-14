import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import DOIList from '../DOIList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('DOIList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with dois', () => {
    const dois = fromJS([
      { value: '12.1234/1234567890123_1234' },
      {
        value: '99.9999/9999999999999_9999',
        material: 'erratum',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<DOIList dois={dois} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
