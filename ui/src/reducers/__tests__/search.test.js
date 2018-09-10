import { Map, fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';

import reducer, { searchScopes } from '../search';
import * as types from '../../actions/actionTypes';

describe('search reducer', () => {
  it('default', () => {
    const state = reducer(undefined, {});
    const expected = fromJS({
      loading: false,
      aggregations: Map(),
      total: 0,
      scope: {
        name: 'literature',
        pathname: 'literature',
        query: {
          sort: 'mostrecent',
          size: '25',
        },
      },
    });
    expect(state).toEqual(expected);
  });

  xit('LOCATION_CHANGE authors', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: { pathname: '/authors/12345' },
    });
    expect(state.get('scope')).toEqual(searchScopes.get('authors'));
  });

  it('LOCATION_CHANGE literature', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: { pathname: '/literature?q=CERN' },
    });
    expect(state.get('scope')).toEqual(searchScopes.get('literature'));
  });

  it('LOCATION_CHANGE something else', () => {
    const state = reducer(Map(), {
      type: LOCATION_CHANGE,
      payload: { pathname: '/something/else' },
    });
    expect(state.get('scope')).toEqual(searchScopes.get('literature'));
  });

  it('CHANGE_SEARCH_SCOPE', () => {
    const scope = searchScopes.keys()[0];
    const state = reducer(Map(), {
      type: types.CHANGE_SEARCH_SCOPE,
      payload: scope,
    });
    expect(state.get('scope')).toEqual(searchScopes.get(scope));
  });

  it('SEARCH_REQUEST', () => {
    const state = reducer(Map(), { type: types.SEARCH_REQUEST });
    const expected = Map({ loading: true });
    expect(state).toEqual(expected);
  });

  it('SEARCH_SUCCESS', () => {
    const payload = {
      aggregations: {},
      hits: {
        hits: ['found'],
        total: 1,
      },
    };
    const state = reducer(Map(), { type: types.SEARCH_SUCCESS, payload });
    const expected = fromJS({
      loading: false,
      aggregations: {},
      total: payload.hits.total,
      results: payload.hits.hits,
    });
    expect(state).toEqual(expected);
  });

  it('SEARCH_ERROR', () => {
    const state = reducer(Map(), {
      type: types.SEARCH_ERROR,
      payload: { message: 'error' },
    });
    const expected = fromJS({ loading: false, error: { message: 'error' } });
    expect(state).toEqual(expected);
  });
});
