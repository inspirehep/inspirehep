import React from 'react';
import { List, fromJS } from 'immutable';
import { shallow } from 'enzyme';

import AggregationFilter from '../AggregationFilter';

describe('AggregationFilter', () => {
  it('render initial state with all props set', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket2',
        doc_count: 2,
      },
    ]);
    const wrapper = shallow(<AggregationFilter
      onChange={jest.fn()}
      buckets={buckets}
      name="Test"
      selectedKeys={['bucket1']}
    />);
    expect(wrapper).toMatchSnapshot();
  });

  it('derives selectionMap state from prop selectedKeys', () => {
    const selectedKeys = ['selected1', 'selected2'];
    const wrapper = shallow(<AggregationFilter
      onChange={jest.fn()}
      buckets={List()}
      name="Test"
      selectedKeys={selectedKeys}
    />);
    const { selectionMap } = wrapper.instance().state;
    expect(selectionMap.get('selected1')).toBe(true);
    expect(selectionMap.get('selected2')).toBe(true);
  });

  describe('onBucketChange', () => {
    it('calls onChange with all selections', () => {
      const onChange = jest.fn();
      const wrapper = shallow(<AggregationFilter
        onChange={onChange}
        buckets={List()}
        name="Test"
      />);
      wrapper.instance().onBucketChange('selected1', true);
      expect(onChange).toHaveBeenCalledWith(['selected1']);
      wrapper.instance().onBucketChange('selected2', true);
      expect(onChange).toHaveBeenCalledWith(['selected1', 'selected2']);
    });
  });
});
