import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import MultiSelectAggregation from '../MultiSelectAggregation';
import SelectBox from '../../SelectBox';

import * as constants from '../constants';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../constants');

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('MultiSelectAggregation', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders', () => {
    const buckets = fromJS([
      {
        key: `bucket1`,
        doc_count: 1,
      },
      {
        key: `bucket2`,
        doc_count: 2,
      },
    ]);
    const wrapper = shallow(
      <MultiSelectAggregation
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        name="Test"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders with custom display values if configured', () => {
    const buckets = fromJS([
      {
        key: `unknown bucket`,
        doc_count: 1,
      },
      {
        key: `bucket`,
        doc_count: 2,
      },
    ]);
    // @ts-expect-error ts-migrate(2540) FIXME: Cannot assign to 'SELECT_VALUE_TO_DISPLAY_MAPS_FOR... Remove this comment to see the full error message
    constants.SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG = {
      Test: {
        bucket: 'Bucket (Cool)',
      },
    };
    const wrapper = shallow(
      <MultiSelectAggregation
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        name="Test"
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('calls onChange with checked bucket on select box selections change', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
    ]);
    // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
    const onChange = jest.fn();
    const wrapper = shallow(
      <MultiSelectAggregation
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        onChange={onChange}
        buckets={buckets}
        name="Test"
      />
    );
    const onSelectBoxChange = wrapper.find(SelectBox).prop('onChange');
    onSelectBoxChange(['bucket1']);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(onChange).toHaveBeenCalledWith(['bucket1']);
  });
});
