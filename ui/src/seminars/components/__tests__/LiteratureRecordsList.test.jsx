import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import LiteratureRecordsList from '../LiteratureRecordsList';

describe('LiteratureRecordsList', () => {
  it('renders with multiple records', () => {
    const literatureRecords = fromJS([
      {
        control_number: 123,
        titles: [{ title: 'Title1' }],
        record: { $ref: 'http://localhost:5000/api/literature/123' },
      },
      {
        control_number: 124,
        titles: [{ title: 'Title2' }],
        record: { $ref: 'http://localhost:5000/api/literature/124' },
      },
    ]);
    const wrapper = shallow(
      <LiteratureRecordsList literatureRecords={literatureRecords} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
  it('renders with one record', () => {
    const literatureRecords = fromJS([
      {
        control_number: 123,
        titles: [{ title: 'Title1' }],
        record: { $ref: 'http://localhost:5000/api/literature/123' },
      },
    ]);
    const wrapper = shallow(
      <LiteratureRecordsList literatureRecords={literatureRecords} />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
