import React from 'react';
import { fromJS } from 'immutable';
import { shallow } from 'enzyme';

import TreeAggregation from '../TreeAggregation';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('TreeAggregation', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        // @ts-expect-error ts-migrate(2322) FIXME: Type 'string' is not assignable to type '((string ... Remove this comment to see the full error message
        selections="a|b"
        splitDisplayName
        splitTreeBy="|"
      />
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
