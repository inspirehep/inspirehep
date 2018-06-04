import React from 'react';
import { List, fromJS } from 'immutable';
import { shallow } from 'enzyme';

import CheckboxAggregation from '../CheckboxAggregation';

describe('CheckboxAggregation', () => {
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
    const wrapper = shallow(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with show more button if buckets are more than 10', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket2',
        doc_count: 2,
      },
      {
        key: 'bucket3',
        doc_count: 3,
      },
      {
        key: 'bucket4',
        doc_count: 4,
      },
      {
        key: 'bucket5',
        doc_count: 2,
      },
      {
        key: 'bucket6',
        doc_count: 2,
      },
      {
        key: 'bucket7',
        doc_count: 2,
      },
      {
        key: 'bucket8',
        doc_count: 2,
      },
      {
        key: 'bucket9',
        doc_count: 2,
      },
      {
        key: 'bucket10',
        doc_count: 2,
      },
      {
        key: 'bucket11',
        doc_count: 2,
      },
    ]);
    const wrapper = shallow(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('render more than 10 after show more clicked', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket2',
        doc_count: 2,
      },
      {
        key: 'bucket3',
        doc_count: 3,
      },
      {
        key: 'bucket4',
        doc_count: 4,
      },
      {
        key: 'bucket5',
        doc_count: 2,
      },
      {
        key: 'bucket6',
        doc_count: 2,
      },
      {
        key: 'bucket7',
        doc_count: 2,
      },
      {
        key: 'bucket8',
        doc_count: 2,
      },
      {
        key: 'bucket9',
        doc_count: 2,
      },
      {
        key: 'bucket10',
        doc_count: 2,
      },
      {
        key: 'bucket11',
        doc_count: 2,
      },
    ]);
    const wrapper = shallow(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
      />
    );
    wrapper.instance().onShowMoreClick();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('derives selectionMap state from prop selections', () => {
    const selections = ['selected1', 'selected2'];
    const wrapper = shallow(
      <CheckboxAggregation
        onChange={jest.fn()}
        buckets={List()}
        name="Test"
        selections={selections}
      />
    );
    const { selectionMap } = wrapper.instance().state;
    expect(selectionMap.get('selected1')).toBe(true);
    expect(selectionMap.get('selected2')).toBe(true);
  });

  describe('onSelectionChange', () => {
    it('calls onChange with all selections', () => {
      const onChange = jest.fn();
      const wrapper = shallow(
        <CheckboxAggregation
          onChange={onChange}
          buckets={List()}
          name="Test"
          selections={[]}
        />
      );
      wrapper.instance().onSelectionChange('selected1', true);
      expect(onChange).toHaveBeenCalledWith(['selected1']);
      wrapper.instance().onSelectionChange('selected2', true);
      expect(onChange).toHaveBeenCalledWith(['selected1', 'selected2']);
    });
  });
});
