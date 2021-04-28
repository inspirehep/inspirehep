import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ParentRecordLink from '../ParentRecordLink';

describe('ParentRecordLink', () => {
  it('renders with parent record', () => {
    const parentRecord = fromJS({
      title: 'A title of book',
      record: { $ref: 'http://localhost:5000/api/literature/1234' },
    });
    const wrapper = shallow(<ParentRecordLink parentRecord={parentRecord} />);
    expect(wrapper).toMatchSnapshot();
  });
});
