import { fromJS } from 'immutable';

import {
  AUTHOR_ERROR,
  AUTHOR_REQUEST,
  AUTHOR_SUCCESS,
  CLEAR_STATE,
} from '../actions/actionTypes';

export const initialState = fromJS({
  loading: false,
  data: {},
  error: null,
});

const authorsReducer = (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case AUTHOR_REQUEST:
      return state.set('loading', true);
    case AUTHOR_SUCCESS:
      return state
        .set('loading', false)
        .set('data', fromJS(action.payload))
        .set('error', initialState.get('error'));
    case AUTHOR_ERROR:
      return state
        .set('loading', false)
        .set('error', fromJS(action.payload))
        .set('data', initialState.get('data'));
    default:
      return state;
  }
};

export default authorsReducer;
