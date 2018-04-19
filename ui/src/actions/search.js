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
  const locationQuery = state.router.location.query;
  const baseQuery = state.search.getIn(['scope', 'query']).toJS();
  const pathname = state.search.getIn(['scope', 'pathname']);
  const newQuery = {
    ...locationQuery,
    ...baseQuery,
    ...query,
  };
  const queryString = stringify(newQuery);
  return `${pathname}?${queryString}`;
}

export default function search(query) {
  return async (dispatch, getState, http) => {
    dispatch(searching());

    const state = getState();
    const url = getSearchUrl(state, query);
    if (query) {
      dispatch(push(url));
    }
    try {
      const response = await http.get(url);

      dispatch(searchSuccess(response.data));
    } catch (error) {
      dispatch(searchError(error.data));
    }
  };
}
