import React from 'react';
import { shallow } from 'enzyme';

import RecordUpdateInfo from '../RecordUpdateInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RecordUpdateInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders RecordUpdateInfo with correct update time', () => {
    const testDate = '2020-10-05T13:39:19.083762+00:00';
    const wrapper = shallow(<RecordUpdateInfo updateDate={testDate} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
