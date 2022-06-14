import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import RelatedRecordsList from '../RelatedRecordsList';
import { INSTITUTIONS_PID_TYPE, EXPERIMENTS_PID_TYPE } from '../../constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('RelatedRecordsList', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        label="Institution"
        pidType={INSTITUTIONS_PID_TYPE}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        label="Experiment"
        pidType={EXPERIMENTS_PID_TYPE}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.dive()).toMatchSnapshot();
  });
});
