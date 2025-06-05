import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { fromJS } from 'immutable';

import AggregationFilters from '../AggregationFilters';

describe('AggregationFilters', () => {
  it('renders with all props set', () => {
    const aggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
      agg2: {
        buckets: [
          {
            key: 'foo_2',
            doc_count: 1,
          },
        ],
        meta: {
          title: 'Aggregation 2',
          order: 3,
          split: true,
          type: 'checkbox',
        },
      },
      agg3: {
        buckets: [
          {
            key: 'foo_3',
            doc_count: 1,
          },
        ],
        meta: {
          title: 'Aggregation 3',
          order: 2,
          split: true,
          type: 'checkbox',
          bucket_help: {
            published: {
              text: 'Published papers are believed to have undergone rigorous peer review.',
              link: 'https://inspirehep.net/info/faq/general#published',
            },
          },
        },
      },
    });
    const initialAggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
    });
    const query = { agg1: 'foo' };
    const { asFragment } = render(
      <AggregationFilters
        query={query}
        aggregations={aggregations}
        initialAggregations={initialAggregations}
        numberOfResults={2}
        onAggregationChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with all props set [inline]', () => {
    const aggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
      agg2: {
        buckets: [
          {
            key: 'foo_2',
            doc_count: 1,
          },
        ],
        meta: {
          title: 'Aggregation 2',
          order: 2,
          split: true,
          type: 'checkbox',
        },
      },
    });
    const initialAggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
    });
    const query = { agg1: 'foo' };
    const { asFragment } = render(
      <AggregationFilters
        inline
        query={query}
        aggregations={aggregations}
        initialAggregations={initialAggregations}
        numberOfResults={2}
        onAggregationChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render aggregations with empty buckets', () => {
    const aggregations = fromJS({
      agg1: {
        buckets: [{}],
        meta: {
          title: 'Aggregation 1',
          order: 1,
          type: 'checkbox',
        },
      },
      agg2: {
        buckets: [],
        meta: {
          title: 'Aggregation 2',
          order: 2,
          type: 'checkbox',
        },
      },
    });
    const initialAggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
    });
    const query = {};
    const { asFragment } = render(
      <AggregationFilters
        query={query}
        aggregations={aggregations}
        initialAggregations={initialAggregations}
        numberOfResults={2}
        onAggregationChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render aggregations when numberOfResults is 0', () => {
    const aggregations = fromJS({
      agg: {
        buckets: [
          {
            key: 'foo',
            doc_count: 0,
          },
        ],
        meta: {
          title: 'Jessica Jones',
          order: 1,
          type: 'checkbox',
        },
      },
      emptyAgg: {
        buckets: [],
        meta: {
          title: 'Luke Cage',
          order: 2,
          type: 'checkbox',
        },
      },
    });
    const initialAggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
    });
    const query = {};
    const { asFragment } = render(
      <AggregationFilters
        query={query}
        aggregations={aggregations}
        initialAggregations={initialAggregations}
        numberOfResults={0}
        onAggregationChange={jest.fn()}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onAggregationChange when aggregation is changed', () => {
    const aggregations = fromJS({
      agg: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
          {
            key: 'bar',
            doc_count: 2,
          },
          {
            key: 'uncool',
            doc_count: 3,
          },
        ],
        meta: {
          title: 'Aggregation',
          order: 1,
          type: 'checkbox',
        },
      },
    });
    const initialAggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
    });
    const query = {};
    const onAggregationChange = jest.fn();
    const { container } = render(
      <AggregationFilters
        query={query}
        aggregations={aggregations}
        initialAggregations={initialAggregations}
        numberOfResults={2}
        onAggregationChange={onAggregationChange}
      />
    );

    const fooCheckbox = container
      .querySelector('[data-test-id="checkbox-aggregation-option-foo"]')
      .closest('label')
      .querySelector('input');
    fireEvent.click(fooCheckbox);

    expect(onAggregationChange).toHaveBeenCalledWith('agg', ['foo']);

    const barCheckbox = container
      .querySelector('[data-test-id="checkbox-aggregation-option-bar"]')
      .closest('label')
      .querySelector('input');
    fireEvent.click(barCheckbox);

    expect(onAggregationChange).toHaveBeenCalledWith('agg', ['foo', 'bar']);
  });

  it('renders aggregations when numberOfResults is 0 and displayWhenNoResults is true', () => {
    const aggregations = fromJS({
      agg: {
        buckets: [
          {
            key: 'foo',
            doc_count: 0,
          },
        ],
        meta: {
          title: 'Jessica Jones',
          order: 1,
          type: 'checkbox',
        },
      },
    });
    const initialAggregations = fromJS({
      agg1: {
        buckets: [
          {
            key: 'foo',
            doc_count: 1,
          },
        ],
        meta: {
          title: '[Range] Aggregation 1',
          order: 1,
          type: 'range',
        },
      },
    });
    const query = {};
    const { asFragment } = render(
      <AggregationFilters
        query={query}
        aggregations={aggregations}
        initialAggregations={initialAggregations}
        numberOfResults={0}
        onAggregationChange={jest.fn()}
        displayWhenNoResults
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
