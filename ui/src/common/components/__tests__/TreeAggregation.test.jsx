import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

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
    const { getByText } = render(
      <TreeAggregation
        onChange={jest.fn()}
        buckets={buckets}
        name="Test"
        selections="a|b"
        splitDisplayName
        splitTreeBy="|"
      />
    );
    expect(getByText('Test')).toBeInTheDocument();
    expect(getByText('a')).toBeInTheDocument();
    expect(getByText('b')).toBeInTheDocument();
    expect(getByText('c')).toBeInTheDocument();
    expect(getByText('d')).toBeInTheDocument();
    expect(getByText('j')).toBeInTheDocument();
  });
});
