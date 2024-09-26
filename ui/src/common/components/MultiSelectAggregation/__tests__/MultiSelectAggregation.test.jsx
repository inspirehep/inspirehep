import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import MultiSelectAggregation from '../MultiSelectAggregation';
import SelectBox from '../../SelectBox';

import * as constants from '../constants';

jest.mock('../constants');

describe('MultiSelectAggregation', () => {
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
        name="Test"
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

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
    constants.SELECT_VALUE_TO_DISPLAY_MAPS_FOREACH_AGG = {
      Test: {
        bucket: 'Bucket (Cool)',
      },
    };
    const wrapper = shallow(
      <MultiSelectAggregation
        name="Test"
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onChange with checked bucket on select box selections change', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
    ]);
    const onChange = jest.fn();
    const wrapper = shallow(
      <MultiSelectAggregation
        onChange={onChange}
        buckets={buckets}
        name="Test"
      />
    );
    const onSelectBoxChange = wrapper.find(SelectBox).prop('onChange');
    onSelectBoxChange(['bucket1']);
    expect(onChange).toHaveBeenCalledWith(['bucket1']);
  });
});
