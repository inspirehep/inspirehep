import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import TreeAggregation from '../TreeAggregation';

describe('TreeAggregation', () => {
  it('render initial state with all props set', () => {
    const buckets = fromJS([
      {
        key: 'a',
        doc_count: 2,
      },
      {
        key: 'a|b',
        doc_count: 2,
      },
      {
        key: 'a',
        doc_count: 3,
      },
      {
        key: 'j',
        doc_count: 2,
      },
      {
        key: 'a|b|c',
        doc_count: 1,
      },
      {
        key: 'a|b|d',
        doc_count: 1,
      },
    ]);
    const wrapper = shallow(
      <TreeAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="a|b"
        splitDisplayName
        splitTreeBy="|"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });
});
