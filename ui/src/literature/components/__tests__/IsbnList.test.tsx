import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import IsbnList from '../IsbnList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('IsbnList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders isbns with medium and without medium', () => {
    const isbns = fromJS([
      {
        value: '9781139632478',
        medium: 'print',
      },
      {
        value: '1231139632475',
      },
    ]);
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    const wrapper = shallow(<IsbnList isbns={isbns} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
