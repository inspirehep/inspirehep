import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import RelatedRecordsList from '../RelatedRecordsList';

describe('RelatedRecordsList', () => {
  it('renders with multiple records', () => {
    const relatedRecords = fromJS([
      {
        control_number: 123,
        legacy_ICN: 'Inst 1',
      },
      {
        control_number: 124,
        legacy_ICN: 'Inst 3',
      },
    ]);
    const wrapper = shallow(
      <RelatedRecordsList
        relatedRecords={relatedRecords}
        relationType="Subsidiary"
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
  it('renders with one record', () => {
    const relatedRecords = fromJS([
      {
        control_number: 123,
        legacy_ICN: 'Inst 1',
      },
    ]);
    const wrapper = shallow(
      <RelatedRecordsList
        relatedRecords={relatedRecords}
        relationType="Subsidiary"
      />
    );
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
