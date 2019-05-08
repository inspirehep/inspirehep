import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import EmbeddedSearch from '../EmbeddedSearch';
import SearchResults from '../SearchResults';
import SearchPagination from '../SearchPagination';
import SortBy from '../SortBy';
import AggregationFilters from '../AggregationFilters';

describe('EmbeddedSearch', () => {
  it('renders with only required props', () => {
    const renderResultItem = jest.fn();
    const wrapper = shallow(
      <EmbeddedSearch
        query={{ size: 2, page: 2 }}
        renderResultItem={renderResultItem}
      />
    );
    expect(wrapper.find(SearchResults)).toHaveProp(
      'renderItem',
      renderResultItem
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with only required props and error', () => {
    const renderResultItem = jest.fn();
    const wrapper = shallow(
      <EmbeddedSearch
        query={{ size: 2, page: 2 }}
        renderResultItem={renderResultItem}
        error={fromJS({ message: 'error' })}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with all props set except error', () => {
    const wrapper = shallow(
      <EmbeddedSearch
        renderResultItem={jest.fn()}
        onQueryChange={jest.fn()}
        query={{ doc_type: 'article', size: 2, page: 2 }}
        aggregations={fromJS({
          agg1: { foo: 'bar' },
        })}
        results={fromJS([{ value: '1' }, { value: '2' }])}
        numberOfResults={5}
        loadingAggregations
        loadingResults
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls onQueryChange on pagination page change', async () => {
    const onQueryChange = jest.fn();
    const wrapper = shallow(
      <EmbeddedSearch
        query={{ size: 2, page: 2 }}
        renderResultItem={jest.fn()}
        onQueryChange={onQueryChange}
      />
    );
    const onPaginationPageChange = wrapper
      .find(SearchPagination)
      .prop('onPageChange');
    await onPaginationPageChange(5);
    expect(onQueryChange).toHaveBeenCalledWith({ page: 5 });
  });

  it('calls onQueryChange on sort change and resets page to 1', async () => {
    const onQueryChange = jest.fn();
    const wrapper = shallow(
      <EmbeddedSearch
        query={{ size: 2, page: 2 }}
        renderResultItem={jest.fn()}
        onQueryChange={onQueryChange}
      />
    );
    const onSortChange = wrapper.find(SortBy).prop('onSortChange');
    await onSortChange('mostcited');
    expect(onQueryChange).toHaveBeenCalledWith({ sort: 'mostcited', page: 1 });
  });

  // TODO: enable when ResponsiveView works with unit tests
  xit('calls onQueryChange on aggregation change and resets page to 1', async () => {
    const onQueryChange = jest.fn();
    const wrapper = shallow(
      <EmbeddedSearch
        query={{ size: 2, page: 2 }}
        renderResultItem={jest.fn()}
        onQueryChange={onQueryChange}
      />
    );
    const onAggregationChange = wrapper
      .find(AggregationFilters)
      .prop('onAggregationChange');
    await onAggregationChange('author', ['Dude', 'Guy']);
    expect(onQueryChange).toHaveBeenCalledWith({
      author: ['Dude', 'Guy'],
      page: 1,
    });
  });
});
