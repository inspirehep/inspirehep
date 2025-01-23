import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import ParentRecordInfo from '../ParentRecordInfo';

describe('ParentRecordInfo', () => {
  it('renders with parent record', () => {
    const parentRecord = fromJS([
      {
        title: 'A title of book',
        record: { $ref: 'http://localhost:5000/api/literature/1234' },
      },
    ]);
    const wrapper = shallow(<ParentRecordInfo parentRecord={parentRecord} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with subtitle and pages in parent record', () => {
    const parentRecord = fromJS([
      {
        title: 'A title of book',
        subtitle: 'A subtitle',
        page_start: '1',
        page_end: '10',
        record: { $ref: 'http://localhost:5000/api/literature/1234' },
      },
    ]);
    const wrapper = shallow(<ParentRecordInfo parentRecord={parentRecord} />);
    expect(wrapper).toMatchSnapshot();
  });
});
