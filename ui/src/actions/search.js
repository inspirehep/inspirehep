import { push } from 'react-router-redux';
import { stringify } from 'qs';

import * as types from './actionTypes';

function searching() {
  return {
    type: types.SEARCHING,
  };
}

function searchSuccess(result) {
  return {
    type: types.SEARCH_SUCCESS,
    payload: result,
  };
}

function searchError(error) {
  return {
    type: types.SEARCH_ERROR,
    payload: error,
  };
}

function getSearchUrl(state, query) {
  const pathname = state.search.getIn(['scope', 'pathname']);
  const queryString = stringify(query, { indices: false });
  return `${pathname}?${queryString}`;
}

function appendQuery(state, query) {
  const baseQuery = state.search.getIn(['scope', 'query']).toJS();
  const locationQuery = state.router.location.query;

  if (query && locationQuery.page !== undefined) {
    locationQuery.page = 1;
  }

  return {
    ...baseQuery,
    ...locationQuery,
    ...query,
  };
}

export default function search(query) {
  return async (dispatch, getState, http) => {
    dispatch(searching());

    const state = getState();
    const newQuery = appendQuery(state, query);
    const url = getSearchUrl(state, newQuery);
    if (Object.keys(newQuery).length > 0) {
      dispatch(push(url));
    }
    try {
      const response = await http.get(url, {
        headers: { Accept: 'application/vnd+inspire.brief+json' },
      });

      dispatch(searchSuccess(response.data));
    } catch (error) {
      dispatch(searchError(error.data));
    }
  };
}
