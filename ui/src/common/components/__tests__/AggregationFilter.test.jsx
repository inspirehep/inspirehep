import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import AggregationFilter from '../AggregationFilter';
import RangeAggregation from '../RangeAggregation';

describe('AggregationFilter', () => {
  it('renders RangeAggregation if aggregation type is range', () => {
    const realMaximumMaxDefaultValue = RangeAggregation.defaultProps.maximumMax;
    RangeAggregation.defaultProps.maximumMax = 2018;

    const buckets = fromJS([
      {
        key: '2011',
        doc_count: 1,
      },
      {
        key: '2012',
        doc_count: 2,
      },
    ]);
    const initialBuckets = fromJS([
      {
        key: '2011',
        doc_count: 111,
      },
      {
        key: '2012',
        doc_count: 12,
      },
    ]);

    const { asFragment } = render(
      <AggregationFilter
        onChange={jest.fn()}
        buckets={buckets}
        initialBuckets={initialBuckets}
        name="Test"
        selections="2011--2012"
        aggregationType="range"
      />
    );
    expect(asFragment()).toMatchSnapshot();
    RangeAggregation.defaultProps.maximumMax = realMaximumMaxDefaultValue;
  });

  it('renders CheckboxAggregation if aggregation type is checkbox', () => {
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
    const { asFragment } = render(
      <AggregationFilter
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections={['bucket1']}
        aggregationType="checkbox"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders MultiSelectAggregation if aggregation type is multiselect', () => {
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
    const { asFragment } = render(
      <AggregationFilter
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
        aggregationType="multiselect"
        name="Test"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders TreeAggregation if aggregation type is tree', () => {
    const buckets = fromJS([
      {
        key: 'bucket1',
        doc_count: 1,
      },
      {
        key: 'bucket1|bucket2',
        doc_count: 2,
      },
    ]);
    const { asFragment } = render(
      <AggregationFilter
        onChange={jest.fn()}
        buckets={buckets}
        selections={['bucket1']}
        aggregationType="tree"
        name="Test"
        splitTreeBy="|"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
