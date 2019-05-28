import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import MultiSelectAggregation from '../MultiSelectAggregation';
import SelectBox from '../SelectBox';

describe('MultiSelectAggregation', () => {
  it('render initial state with all props set', () => {
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
