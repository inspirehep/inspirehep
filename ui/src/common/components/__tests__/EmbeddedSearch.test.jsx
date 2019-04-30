import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';
import MockAdapter from 'axios-mock-adapter';

import EmbeddedSearch from '../EmbeddedSearch';
import http from '../../http';
import SearchPagination from '../SearchPagination';
import SortBy from '../SortBy';

const mockHttp = new MockAdapter(http);

function nextTick() {
  return new Promise(resolve => {
    setImmediate(() => resolve());
  });
}

describe('EmbeddedSearch', () => {
  afterEach(() => {
    mockHttp.reset();
  });

  it('renders with loading state true then initial search results', async () => {
    const searchQuery = 'page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch pidType="literature" renderResultItem={jest.fn()} />
    );
    expect(wrapper).toMatchSnapshot();
    await nextTick();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with initial search results when base query props are set', async () => {
    const searchQuery = 'author=Harun&page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?facet_name=custom&${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch
        pidType="literature"
        renderResultItem={jest.fn()}
        baseQuery={fromJS({ author: 'Harun' })}
        baseFacetsQuery={fromJS({ facet_name: 'custom' })}
      />
    );
    await nextTick();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders error if results request fails', done => {
    const searchQuery = 'page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature/facets?${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      })
      .onGet(`/literature?${searchQuery}`)
      .networkError();
    const wrapper = shallow(
      <EmbeddedSearch pidType="literature" renderResultItem={jest.fn()} />
    );
    setImmediate(() => {
      wrapper.update();
      expect(wrapper).toMatchSnapshot();
      done();
    });
  });

  it('renders error if facets request fails with custom error', async () => {
    const searchQuery = 'page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?${searchQuery}`)
      .networkError();

    const wrapper = shallow(
      <EmbeddedSearch
        pidType="literature"
        renderResultItem={jest.fn()}
        renderError={() => <span>Error</span>}
      />
    );
    await nextTick();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders with new results after aggregation change', async () => {
    const searchQuery = 'page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature?${searchQuery}&agg1=foo`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 2 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      })
      .onGet(`/literature/facets?${searchQuery}&agg1=foo`)
      .replyOnce(200, {
        aggregations: {
          agg2: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch pidType="literature" renderResultItem={jest.fn()} />
    );
    await nextTick();
    wrapper.update();
    const { onAggregationChange } = wrapper.instance();
    await onAggregationChange('agg1', 'foo');
    await nextTick();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders with new results after page change', async () => {
    const searchQuery = 'size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?page=1&${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature?page=2&${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 2 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?page=1&${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      })
      .onGet(`/literature/facets?page=2&${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg2: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch pidType="literature" renderResultItem={jest.fn()} />
    );
    await nextTick();
    wrapper.update();
    const onPageChange = wrapper.find(SearchPagination).prop('onPageChange');
    await onPageChange(2);
    await nextTick();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders with new results after sort change', async () => {
    const searchQuery = 'page=1&size=10';
    mockHttp
      .onGet(`/literature?${searchQuery}&sort=mostrecent`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature?${searchQuery}&sort=mostcited`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 2 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?${searchQuery}&sort=mostrecent`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      })
      .onGet(`/literature/facets?${searchQuery}&sort=mostcited`)
      .replyOnce(200, {
        aggregations: {
          agg2: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch pidType="literature" renderResultItem={jest.fn()} />
    );
    await nextTick();
    wrapper.update();
    const onSortChange = wrapper.find(SortBy).prop('onSortChange');
    await onSortChange('mostcited');
    await nextTick();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders with new results after pidType prop change', async () => {
    const searchQuery = 'page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/authors?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 2 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      })
      .onGet(`/authors/facets?${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg2: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch pidType="literature" renderResultItem={jest.fn()} />
    );
    await nextTick();
    wrapper.update();
    wrapper.setProps({ pidType: 'authors' });
    await nextTick();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders with new results after baseQuery prop change', async () => {
    const searchQuery = 'page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?author=ahmet&${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature?author=harun&${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 2 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?author=ahmet&${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      })
      .onGet(`/literature/facets?author=harun&${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg2: {},
        },
      });
    const wrapper = shallow(
      <EmbeddedSearch
        pidType="literature"
        baseQuery={fromJS({ author: 'ahmet' })}
        renderResultItem={jest.fn()}
      />
    );
    await nextTick();
    wrapper.update();
    wrapper.setProps({ baseQuery: fromJS({ author: 'harun' }) });
    await nextTick();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
  });

  it('renders with current results if baseQuery is changed but equals to previous one', async () => {
    const searchQuery = 'author=ahmet&page=1&size=10&sort=mostrecent';
    mockHttp
      .onGet(`/literature?${searchQuery}`)
      .replyOnce(200, {
        hits: {
          hits: [{ id: 1 }],
          total: 1,
        },
      })
      .onGet(`/literature/facets?${searchQuery}`)
      .replyOnce(200, {
        aggregations: {
          agg1: {},
        },
      });
    const baseQuery = fromJS({ author: 'ahmet' });
    const wrapper = shallow(
      <EmbeddedSearch
        pidType="literature"
        baseQuery={baseQuery}
        renderResultItem={jest.fn()}
      />
    );
    await nextTick();
    wrapper.update();
    wrapper.setProps({ baseQuery: baseQuery.set('author', 'ahmet') });
    await nextTick();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });
});
