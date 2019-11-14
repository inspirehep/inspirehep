import { fromJS } from 'immutable';

import middleware from '../searchDispatcher';
import {
  searchForCurrentQuery,
  fetchSearchAggregationsForCurrentQuery,
  newSearch,
} from '../../actions/search';
import { LITERATURE_NS } from '../../reducers/search';
import {
  SEARCH_QUERY_UPDATE,
  SEARCH_BASE_QUERIES_UPDATE,
} from '../../actions/actionTypes';

jest.mock('../../actions/search');

describe('searchDispatcher middleware', () => {
  let dispatch;
  const namespace = LITERATURE_NS;

  beforeEach(() => {
    const baseQuery = fromJS({ sort: 'mostrecent', author: ['Dude_1234'] });
    let search = fromJS({
      namespaces: {
        [namespace]: {
          query: baseQuery,
          baseQuery,
          baseAggregationsQuery: {},
        },
      },
    });
    const getState = () => ({ search });
    // FIXME: too much mocking, to imitate search reducer
    // consider `store` integration tests for these cases
    const next = action => {
      search = search
        .mergeIn(
          ['namespaces', namespace, 'baseQuery'],
          action.payload.baseQuery
        )
        .mergeIn(['namespaces', namespace, 'query'], action.payload.query)
        .mergeIn(
          ['namespaces', namespace, 'baseAggregationsQuery'],
          action.payload.baseAggregationsQuery
        );
    };
    dispatch = middleware({ getState, dispatch: jest.fn() })(next);
  });

  afterEach(() => {
    searchForCurrentQuery.mockClear();
    fetchSearchAggregationsForCurrentQuery.mockClear();
    newSearch.mockClear();
  });

  it('dispatches search and fetch aggregations when initial SEARCH_QUERY_UPDATE with empty query', () => {
    const action = {
      type: SEARCH_QUERY_UPDATE,
      payload: { namespace, query: {} },
    };
    dispatch(action);
    expect(searchForCurrentQuery).toHaveBeenCalledWith(namespace);
    expect(fetchSearchAggregationsForCurrentQuery).toHaveBeenCalledWith(
      namespace
    );
  });

  it('dispatches search and fetch aggregations when SEARCH_QUERY_UPDATE changes query', () => {
    const action = {
      type: SEARCH_QUERY_UPDATE,
      payload: { namespace, query: { doc_type: 'book' } },
    };
    dispatch(action);
    expect(searchForCurrentQuery).toHaveBeenCalledWith(namespace);
    expect(fetchSearchAggregationsForCurrentQuery).toHaveBeenCalledWith(
      namespace
    );
  });

  it('dispatches only search when SEARCH_QUERY_UPDATE changes page in query', () => {
    const action = {
      type: SEARCH_QUERY_UPDATE,
      payload: { namespace, query: { page: 2 } },
    };
    dispatch(action);
    expect(searchForCurrentQuery).toHaveBeenCalledWith(namespace);
    expect(fetchSearchAggregationsForCurrentQuery).not.toHaveBeenCalled();
  });

  it('dispatches only search when SEARCH_QUERY_UPDATE changes sort in query', () => {
    const action = {
      type: SEARCH_QUERY_UPDATE,
      payload: { namespace, query: { sort: 'mostcited' } },
    };
    dispatch(action);
    expect(searchForCurrentQuery).toHaveBeenCalledWith(namespace);
    expect(fetchSearchAggregationsForCurrentQuery).not.toHaveBeenCalled();
  });

  it('dispatches newSearch when query update has different `q` then current ', () => {
    const action = {
      type: SEARCH_QUERY_UPDATE,
      payload: { namespace, query: { sort: 'mostcited', q: 'dude' } },
    };
    dispatch(action);
    expect(newSearch).toHaveBeenCalledWith(namespace);
  });

  it('does not dispatch newSearch when query update without q', () => {
    const action = {
      type: SEARCH_QUERY_UPDATE,
      payload: { namespace, query: { page: '2' } },
    };
    dispatch(action);
    expect(newSearch).not.toHaveBeenCalled();
  });

  it('dispatches search and fetch aggregations when SEARCH_BASE_QUERIES_UPDATE changes base query', () => {
    const action = {
      type: SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseQuery: { author: ['1234_Dude'] } },
    };
    dispatch(action);
    expect(searchForCurrentQuery).toHaveBeenCalledWith(namespace);
    expect(fetchSearchAggregationsForCurrentQuery).toHaveBeenCalledWith(
      namespace
    );
  });

  it('dispatches search and fetch aggregations when SEARCH_BASE_QUERIES_UPDATE changes base aggregations query', () => {
    const action = {
      type: SEARCH_BASE_QUERIES_UPDATE,
      payload: { namespace, baseAggregationsQuery: { facet_name: 'test' } },
    };
    dispatch(action);
    expect(searchForCurrentQuery).not.toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentQuery).toHaveBeenCalledWith(
      namespace
    );
  });

  it('returns next(action) for any action', () => {
    // custom one is created to be able to mock `next`
    const getState = () => {};
    const next = jest.fn(() => 'NEXT');
    const customDispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const action = {
      type: 'WHATEVER',
      payload: {},
    };
    const result = customDispatch(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(result).toEqual('NEXT');
  });
});
