import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ReportNumberList from '../ReportNumberList';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ReportNumberList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with report numbers', () => {
    const reportNumbers = fromJS([
      {
        value: 'ABCD-AB-CD-1234-123',
      },
    ]);
    const wrapper = shallow(<ReportNumberList reportNumbers={reportNumbers} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
