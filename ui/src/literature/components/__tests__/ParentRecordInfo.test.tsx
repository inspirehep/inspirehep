import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ParentRecordInfo from '../ParentRecordInfo';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ParentRecordInfo', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with parent record', () => {
    const parentRecord = fromJS({
      title: 'A title of book',
      record: { $ref: 'http://localhost:5000/api/literature/1234' },
    });
    const wrapper = shallow(<ParentRecordInfo parentRecord={parentRecord} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with parent record', () => {
    const parentRecord = fromJS({
      title: 'A title of book',
      subtitle: 'A subtitle',
      record: { $ref: 'http://localhost:5000/api/literature/1234' },
    });
    const wrapper = shallow(<ParentRecordInfo parentRecord={parentRecord} />);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
