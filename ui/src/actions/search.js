import { push } from 'react-router-redux';

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

export default function search(query) {
  return async (dispatch, getState, http) => {
    dispatch(searching());
    try {
      const url = `?q=${query}`;
      const response = await http.get(url);
      dispatch(push(url));
      dispatch(searchSuccess(response.data));
    } catch (error) {
      dispatch(searchError(error.data));
    }
  };
}
