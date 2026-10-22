import { fromJS } from 'immutable';

import {
  AUTHORLIST_ERROR,
  AUTHORLIST_REQUEST,
  AUTHORLIST_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  authors: null,
  warnings: null,
  error: null,
});

const authorlistReducer = (state = initialState, action) => {
  const { payload } = action;
  switch (action.type) {
    case AUTHORLIST_REQUEST:
      return state
        .set('loading', true)
        .set('authors', initialState.get('authors'))
        .set('warnings', initialState.get('warnings'))
        .set('error', initialState.get('error'));
    case AUTHORLIST_SUCCESS:
      return state
        .set('loading', false)
        .set('authors', fromJS(payload.authors))
        .set('warnings', fromJS(payload.warnings));
    case AUTHORLIST_ERROR:
      return state
        .set('loading', false)
        .set('error', payload.error.message ?? 'An error occurred');
    default:
      return state;
  }
};

export default authorlistReducer;
