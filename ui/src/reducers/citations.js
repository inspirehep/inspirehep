import { fromJS } from 'immutable';

import {
  CITATIONS_REQUEST,
  CITATIONS_ERROR,
  CITATIONS_SUCCESS,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: [],
  total: 0,
  error: null,
});

const citationsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CITATIONS_REQUEST:
      return state.set('loading', true);
    case CITATIONS_SUCCESS:
      return state
        .set('loading', false)
        .set('error', initialState.get('error'))
        .set('data', fromJS(action.payload.metadata.citations))
        .set('total', action.payload.metadata.citation_count);
    case CITATIONS_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload))
        .set('data', initialState.get('data'))
        .set('total', initialState.get('total'));
    default:
      return state;
  }
};

export default citationsReducer;
